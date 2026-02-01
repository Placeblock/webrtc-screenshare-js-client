const connectionConfig = {
    iceServers: [{
        urls: ["stun:stun.l.google.com:19302"]
    }]
}

export default class Peer {
    uuid;
    name;
    connection;
    polite = null;
    peerPolite = null;
    politeNumber = Math.random();
    streamRunning = false;
    makingOffer = false;
    peerFullscreen = false;
    fullScreen = false;
    onConnect;
    onSendMessage;
    peerControlElement;
    peerElement;
    onPeerFullscreen;

    lastSenderBitrateResult = {};
    lastReceiverBitrateResult = {};
    sendingBitRate = 0;
    receivingBitRate = 0;
    bitRateInterval = null;

    constructor(uuid, name, 
            peerControlElement,
            peerElement,
            onConnect, onSendMessage,
            onPeerFullscreen) {
        this.uuid = uuid;
        this.name = name;
        this.peerControlElement = peerControlElement;
        this.peerElement = peerElement;
        this.onConnect = onConnect;
        this.onSendMessage = onSendMessage;
        this.onPeerFullscreen = onPeerFullscreen;

        this.connection = new RTCPeerConnection(connectionConfig);
        this.connection.ontrack = this.handleTrackEvent.bind(this);
        this.connection.onnegotiationneeded = this.handleNegotiationNeededEvent.bind(this);
        this.connection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent.bind(this);
        this.connection.onicecandidate = this.handleICECandidateEvent.bind(this);

        this.sendMessage("polite_request", {number: this.politeNumber});
    }

    sendMessage(action, data) {
        this.onSendMessage("peer", { receiver: this.uuid, message: { action: action, ...data } })
    }

    updateQuality(streamSettings) {
        const data = streamSettings[this.peerFullscreen?"fullscreen":"minimized"];
        this.connection.getSenders().forEach((sender) => {
            if (sender.track != null && sender.track.kind === "video") {
                const parameters = sender.getParameters();
                if (!parameters.encodings || parameters.encodings.length===0) {
                    parameters.encodings = [{}];
                }
                parameters.encodings[0].scaleResolutionDownBy = 1/data.scaleFactor;
                parameters.encodings[0].maxFramerate = data.frameRate;
                sender.setParameters(parameters)
                    .then(() => console.log("Bitrate changed successfully"))
                    .catch(e => console.error(e));
            }
        })
    }

    startStreaming(stream, streamSettings) {
        try {
            this.stopStreaming();
            if (stream == null) return;
            stream.getTracks().forEach(track => {
                this.connection.addTrack(track, stream);
            })
            this.updateQuality(streamSettings);
            this.streamRunning = true;
            this.peerControlElement.setStreaming(true);
        } catch (error) {
            alert(error);
        }
    }

    stopStreaming() {
        this.connection.getSenders().forEach((sender) => {
            this.connection.removeTrack(sender);
        })
        this.streamRunning = false;
        this.peerControlElement.setStreaming(false);
    }

    handleTrackEvent({ track, streams }) {
        this.peerElement.setStream(streams[0]);
        streams[0].onremovetrack = () => {
            this.peerElement.setStream(null);
        }
    }

    setFullScreen(fullScreen) {
        this.sendMessage("fullscreen", {fullscreen: fullScreen});
        this.fullScreen = fullScreen;
    }


    // NEGOTIATION

    async handleNegotiationNeededEvent() {
        try {
            this.makingOffer = true;
            await this.connection.setLocalDescription();
            this.sendMessage("description", { description: JSON.stringify(this.connection.localDescription) });
        } catch (err) {
            console.error(err);
        } finally {
            this.makingOffer = false;
        }
    }

    async handleICEConnectionStateChangeEvent() {
        if (this.connection.iceConnectionState === "failed") {
            this.connection.restartIce();
        }
    }

    handleICECandidateEvent({ candidate }) {
        this.sendMessage("ice_candidate", { candidate: JSON.stringify(candidate) })
    }

    async handlePeerMessage(data) {
        switch (data.action) {
            case "description":
                const description = JSON.parse(data.description);
                await this.handleReceivedDescription(description);
                break;
            case "ice_candidate":
                const candidate = JSON.parse(data.candidate);
                await this.handleReceivedICECandidate(candidate);
                break;
            case "polite_request":
                const senderNumber = data.number;
                this.handleReceivedPoliteRequest(senderNumber);
                break;
            case "polite_response":
                this.handleReceivedPoliteResponse(data);
                break;
            case "fullscreen":
                const fullScreen = data.fullscreen;
                this.handleReceivedFullscreen(fullScreen);
                break;
            default:
                console.warn("Invalid Message received:");
                console.log(data);
                break;
        }
    }

    handleReceivedFullscreen(fullScreen) {
        this.peerFullscreen = fullScreen;
        this.onPeerFullscreen();
    }

    handleReceivedPoliteResponse(data) {
        this.peerPolite = data.polite;
        this.polite = !data.polite;
        this.onConnect();
    }

    handleReceivedPoliteRequest(number) {
        this.polite = this.politeNumber>number;
        this.peerPolite = !this.polite;
        this.sendMessage("polite_response", {polite: this.polite});
        this.onConnect();
    }

    async handleReceivedICECandidate(candidate) {
        await this.connection.addIceCandidate(candidate).catch(e => {
            console.error(e);
        });
    }

    async handleReceivedDescription(description) {
        const offerCollision =
            description.type === "offer" &&
            (this.makingOffer || this.connection.signalingState !== "stable");
        if (!this.polite && offerCollision) {
            return;
        }
        await this.connection.setRemoteDescription(description);
        if (description.type === "offer") {
            await this.connection.setLocalDescription();
            const localDesc = this.connection.localDescription;
            this.sendMessage("description", { description: JSON.stringify(localDesc) });
        }
    }

    isConnected() {
        return this.polite!=null&&this.peerPolite!=null;
    }

    async updateBitrate() {
        var newSendingBitrate = 0;
        var newReceivingBitRate = 0;
        const transceivers = this.connection.getTransceivers();
        for (let i = 0; i < transceivers.length; i++) {
            const t = transceivers[i];
            if (t.currentDirection == null) return;
            if (t.currentDirection.includes("recv")) {
                const res = await t.receiver.getStats();
                newReceivingBitRate += this.getBitrate(res, this.lastReceiverBitrateResult[i], (rep) => rep.bytesReceived, "inbound-rtp");
                this.lastReceiverBitrateResult[i] = res;
            }
            if (t.currentDirection.includes("send")) {
                const res = await t.sender.getStats();
                newSendingBitrate += this.getBitrate(res, this.lastSenderBitrateResult[i], (rep) => rep.bytesSent, "outbound-rtp");
                this.lastSenderBitrateResult[i] = res;
            }
        }
        this.sendingBitRate = newSendingBitrate;
        this.receivingBitRate = newReceivingBitRate;
        this.peerControlElement.setBitrate(this.sendingBitRate);
        this.peerElement.setBitrate(this.receivingBitRate);
    }

    getBitrate(result, lastResult, getBytes, type) {
        for (const [key, rep] of result.entries()) {
            if (rep.type === type && lastResult !== undefined &&
                lastResult.has(rep.id)) {
                const now = rep.timestamp;
                const bytes = getBytes(rep);
                const bitrate = 8 * (bytes - getBytes(lastResult.get(rep.id))) /
                    (now - lastResult.get(rep.id).timestamp);
                return Math.round(bitrate);
            }
        }
        return 0;
    }

    remove() {
        this.stopStreaming();
        this.connection.close();
        this.peerElement.remove();
        this.peerControlElement.remove();
    }

}
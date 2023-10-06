const connectionConfig = {
    iceServers: [{
        urls: ["stun:stun.l.google.com:19302"]
    }]
}

export default class PeerData {
    uuid;
    name;
    connection;
    polite = null;
    peerPolite = null;
    politeNumber = Math.random();
    streamRunning = false;
    makingOffer = false;
    ignoreOffer = false;
    peerFullscreen = false;
    remoteVideoElement;
    fullScreen = false;
    onConnect;
    onSendMessage;

    constructor(uuid, name, remoteVideoElement, onConnect, onSendMessage) {
        this.uuid = uuid;
        this.name = name;
        this.remoteVideoElement = remoteVideoElement;
        this.onConnect = onConnect;
        this.onSendMessage = onSendMessage;
    }

    createConnection() {
        this.connection = new RTCPeerConnection(connectionConfig);
    }

    sendMessage(action, data) {
        this.onSendMessage("peer", { receiver: this.uuid, message: { action: action, ...data } })
    }

    updateQuality(streamSettings) {
        const data = streamSettings.getData(this.peerFullscreen);
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
        this.stopStreaming();
        if (stream == null) return;
        for (const track of stream.getTracks()) {
            this.connection.addTrack(track, stream);
        }
        this.updateQuality(streamSettings);
        this.streamRunning = true;
    }

    stopSending() {
        this.connection.getTransceivers().forEach(trans => {
            trans.stop()
        })
        this.connection.getSenders().forEach((sender) => {
            this.connection.removeTrack(sender);
        })
        this.streamRunning = false;
    }

    handleTrackEvent({ track, streams }) {
        track.onunmute = () => {
            this.remoteVideoElement.srcObject = streams[0];
        }
    }

    set fullScreen(fullScreen) {
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
            case "ice_candidate":
                const candidate = JSON.parse(data.candidate);
                await this.handleReceivedICECandidate(candidate);
            case "polite_request":
                const senderNumber = data.number;
                this.handleReceivedPoliteRequest(senderNumber);
            case "polite_response":
                this.handleReceivedPoliteResponse();
            case "fullscreen":
                const fullScreen = data.fullscreen;
                this.handleReceivedFullscreen(fullScreen);
            default:
                console.warn("Invalid Message received:");
                console.log(data);
        }
    }

    handleReceivedFullscreen(fullScreen) {
        this.peerFullscreen = fullScreen;
    }

    handleReceivedPoliteResponse() {
        this.peerPolite = data.polite;
        this.polite = !data.polite;
        this.onConnect();
    }

    handleReceivedPoliteRequest(number) {
        this.polite = politeNumber.current>number;
        this.peerPolite = !this.polite;
        this.sendMessage("polite_response", {polite: this.polite});
        this.onConnect();
    }

    isConnected() {
        return this.polite!=null&&this.peerPolite!=null;
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
        const ignore = !this.polite && offerCollision;
        this.ignoreOffer = ignore;
        if (ignore) {
            return;
        }

        await this.connection.setRemoteDescription(description);
        if (description.type === "offer") {
            await this.connection.setLocalDescription();
            const localDesc = this.connection.localDescription;
            sendMessage("description", { description: JSON.stringify(localDesc) });
        }
    }

}
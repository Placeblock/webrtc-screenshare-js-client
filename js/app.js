const peersControlsElement = document.getElementById("peers-controls-container");
const peersElement = document.getElementById("peers-container")
const clientStreamElement = document.getElementById("client-stream");

const peers = [{"uuid": "12345", "name":"Felix"}, {"uuid": "123456", "name":"Paula"}];

peers.forEach((p) => {
    const peerControlElement = createPeerControlElement(p.name, 
        () => toggleStreamingButton(peerControlElement), 
        () => toggleStreamingButton(peerControlElement))
    p.peerControlElement = peerControlElement;
    peersControlsElement.appendChild(peerControlElement);
})

function toggleStreamingButton(peerControlElement) {
    const startBtn = peerControlElement.getElementsByClassName("pc-peer-start-btn")[0];
    const stopBtn = peerControlElement.getElementsByClassName("pc-peer-stop-btn")[0];
    if (startBtn.classList.contains("hidden")) {
        startBtn.classList.remove("hidden");
        stopBtn.classList.add("hidden");
    } else {
        startBtn.classList.add("hidden");
        stopBtn.classList.remove("hidden");
    }
}

//const socket = new WebSocket("wss://stream.codelix.de/wss");

/*socket.onmessage = (data) => {

}*/
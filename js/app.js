const peersControlsElement = document.getElementById("peers-controls-container");
const peersElement = document.getElementById("peers-container")
const clientStreamElement = document.getElementById("client-stream");
const settingsContainerElement = document.getElementById("settings-container");

const peers = [{"uuid": "12345", "name":"Felix"}, {"uuid": "123456", "name":"Paula"}];

peers.forEach((p) => {
    const peerControlElement = createPeerControlElement(p.name, () => {}, () => {});
    p.peerControlElement = peerControlElement;
    peersControlsElement.appendChild(peerControlElement);
    const peerElement = createPeerElement(p.name);
    p.peerElement = peerElement;
    peersElement.appendChild(peerElement);
})

function toggleSettings() {
    settingsContainerElement.classList.toggle("hidden");
}
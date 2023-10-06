

function createPeerControlElement(name, onStart, onStop) {
    const element = document.createElement("li");
    element.className = "pc-peer";
    const nameElement = document.createElement("h3");
    nameElement.className = "pc-peer-name";
    nameElement.innerText = name;
    const bitrateElement = createBitrateInfoElement();
    const buttonsElement = createPeerControlButtonsElement(onStart, onStop);
    element.appendChild(nameElement);
    element.appendChild(bitrateElement);
    element.appendChild(buttonsElement);
    element.setBitrate = bitrateElement.setBitrate;
    return element;
}

function createPeerControlButtonsElement(onStart, onStop) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "pc-peer-btn-container";
    const startButton = createButton("Start", () => {
        startButton.classList.add("hidden");
        stopButton.classList.remove("hidden");
        onStart();
    });
    startButton.className = "pc-peer-start-btn";
    const stopButton = createButton("Stop", () => {
        startButton.classList.remove("hidden");
        stopButton.classList.add("hidden");
        onStop();
    });
    stopButton.className = "pc-peer-stop-btn hidden";
    buttonContainer.appendChild(startButton);
    buttonContainer.appendChild(stopButton);
    return buttonContainer;
}

function createPeerElement(name) {
    const peerElement = document.createElement("div");
    peerElement.className = "peer";
    const peerInfoElement = document.createElement("div");
    peerInfoElement.className = "peer-info"
    const peerNameElement = document.createElement("p");
    peerNameElement.innerText = name;
    peerNameElement.className = "peer-name";
    peerInfoElement.appendChild(peerNameElement);
    const bitrateInfoElement = createBitrateInfoElement();
    peerInfoElement.appendChild(bitrateInfoElement);
    const peerStreamElement = document.createElement("video");
    peerStreamElement.className = "peer-stream hidden";
    const noStreamElement = document.createElement("p");
    noStreamElement.className = "peer-no-stream";
    noStreamElement.innerText = "Not streaming";
    peerElement.appendChild(peerInfoElement);
    peerElement.appendChild(noStreamElement);
    peerElement.appendChild(peerStreamElement);
    peerElement.setStream = (stream) => {
        peerStreamElement.srcObject = stream;
        if (stream == null) {
            noStreamElement.classList.add("hidden");
            peerStreamElement.classList.remove("hidden");
        } else {
            noStreamElement.classList.remove("hidden");
            peerStreamElement.classList.add("hidden");
        }
    }
    peerElement.setBitrate = bitrateInfoElement.setBitrate;
    return peerElement;
}

function createBitrateInfoElement() {
    const bitrateInfoElement = document.createElement("p");
    bitrateInfoElement.className = "bitrate";
    const bitrateElement = document.createElement("span");
    bitrateElement.className = "bitrate-value";
    bitrateElement.innerText = -1;
    const bitrateSuffix = document.createElement("span");
    bitrateSuffix.innerText = " Kbps";
    bitrateInfoElement.appendChild(bitrateElement);
    bitrateInfoElement.appendChild(bitrateSuffix);
    bitrateInfoElement.setBitrate = (bitrate) => {
        bitrateElement.innerText = bitrate;
    }
    return bitrateInfoElement;
}

function createButton(content, onClick) {
    const button = document.createElement("button");
    button.onclick = onClick;
    button.innerHTML = content;
    return button;
}


export function createPeerControlElement(name, onStart, onStop) {
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
    element.setStreaming = buttonsElement.setStreaming;
    return element;
}

function createPeerControlButtonsElement(onStart, onStop) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "pc-peer-btn-container";
    const startButton = createButton("Start", () => {
        if (onStart()) {
            startButton.classList.add("hidden");
            stopButton.classList.remove("hidden");
        }
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
    buttonContainer.setStreaming = (streaming) => {
        startButton.classList.toggle("hidden", streaming);
        stopButton.classList.toggle("hidden", !streaming);
    }
    return buttonContainer;
}

export function createPeerElement(name, onFullscreen) {
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
    peerStreamElement.onloadedmetadata = () => {
        peerStreamElement.play();
    }
    const noStreamElement = document.createElement("p");
    noStreamElement.className = "peer-no-stream";
    noStreamElement.innerText = "Not streaming";

    const fullscreenButtonContainer = document.createElement("div");
    fullscreenButtonContainer.className = "fullscreen-button-container hidden";
    const theatherButton = document.createElement("button");
    theatherButton.className = "theather-button btn";
    theatherButton.innerHTML = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path fill="currentColor" d="M64 64V352H576V64H64zM0 64C0 28.7 28.7 0 64 0H576c35.3 0 64 28.7 64 64V352c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM128 448H512c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>'
    fullscreenButtonContainer.appendChild(theatherButton);
    const fullscreenButton = document.createElement("button");
    fullscreenButton.className = "fullscreen-button btn";
    fullscreenButton.innerHTML = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path fill="currentColor" d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"/></svg>'
    fullscreenButtonContainer.appendChild(fullscreenButton);

    peerElement.onclick = () => {
        if (peerElement.classList.contains("theather")) {
            onFullscreen(false);
            peerElement.classList.remove("theather");
        } else if (document.fullscreenElement !== null) {
            onFullscreen(false);
            document.exitFullscreen();
        }
    }
    peerElement.onfullscreenchange = () => {
        onFullscreen(document.fullscreenElement!==null);
    }
    fullscreenButton.onclick = () => {
        onFullscreen(true);
        peerElement.requestFullscreen().then(() => {
            fullscreenButtonContainer.classList.add("hidden");
        });
    }
    theatherButton.onclick = (e) => {
        e.stopPropagation();
        onFullscreen(true);
        fullscreenButtonContainer.classList.add("hidden");
        peerElement.classList.add("theather");
    }
    var hideFullscreenElementsDelay;
    peerElement.onmouseover = () => {
        if (!peerElement.classList.contains("theather") 
                && !document.fullscreenElement
                && !peerStreamElement.classList.contains("hidden")) {
            fullscreenButtonContainer.classList.remove("hidden");
        }
        volumeSlider.classList.remove("hidden");
        if (document.fullscreenElement) {
            clearTimeout(hideFullscreenElementsDelay);
            hideFullscreenElementsDelay = setTimeout(() => {
                volumeSlider.classList.add("hidden");
            }, 5000);
        }
    }
    peerElement.onmouseleave = () => {
        fullscreenButtonContainer.classList.add("hidden");
        volumeSlider.classList.add("hidden");
    }

    const volumeSlider = createVolumeSlider((vol) => {
        peerStreamElement.volume = vol;
    })
    volumeSlider.className = "peer-volume hidden";

    peerElement.appendChild(peerInfoElement);
    peerElement.appendChild(noStreamElement);
    peerElement.appendChild(peerStreamElement);
    peerElement.appendChild(volumeSlider);
    peerElement.appendChild(fullscreenButtonContainer);
    
    peerElement.setStream = (stream) => {
        if (stream == null) {
            noStreamElement.classList.remove("hidden");
            peerStreamElement.classList.add("hidden");
        } else {
            noStreamElement.classList.add("hidden");
            peerStreamElement.classList.remove("hidden");
        }
        peerStreamElement.srcObject = stream;
    }
    peerElement.setBitrate = bitrateInfoElement.setBitrate;
    return peerElement;
}

function createBitrateInfoElement() {
    const bitrateInfoElement = document.createElement("p");
    bitrateInfoElement.className = "bitrate";
    const bitrateElement = document.createElement("span");
    bitrateElement.className = "bitrate-value";
    bitrateElement.innerText = 0;
    const bitrateSuffix = document.createElement("span");
    bitrateSuffix.innerText = " Kbps";
    bitrateInfoElement.appendChild(bitrateElement);
    bitrateInfoElement.appendChild(bitrateSuffix);
    bitrateInfoElement.setBitrate = (bitrate) => {
        bitrateElement.innerText = bitrate;
    }
    return bitrateInfoElement;
}

const volumeHigh = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path fill="currentColor" d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg>'
function createVolumeSlider(onChange) {
    const volumeElement = document.createElement("div");
    volumeElement.className = "volume";
    const volumeIcon = document.createElement("span");
    volumeIcon.className = "volume-icon";
    volumeIcon.innerHTML = volumeHigh;
    const volumeInput = document.createElement("input");
    volumeInput.className = "volume-input range";
    volumeInput.type = "range";
    volumeInput.step = 0.01;
    volumeInput.min = 0;
    volumeInput.max = 1;
    volumeInput.defaultValue = 0.75;
    volumeInput.oninput = (e) => {
        const value = e.target.value;
        onChange(value);
    }
    volumeInput.onclick = (e) => {
        e.stopPropagation();
    }
    volumeElement.appendChild(volumeIcon);
    volumeElement.appendChild(volumeInput);


    return volumeElement;
}

function createButton(content, onClick) {
    const button = document.createElement("button");
    button.onclick = onClick;
    button.innerHTML = content;
    return button;
}
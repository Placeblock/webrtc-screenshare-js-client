

function createPeerControlElement(name, onStart, onStop) {
    const element = document.createElement("li");
    element.className = "pc-peer";
    const nameElement = document.createElement("h3");
    nameElement.className = "pc-peer-name";
    nameElement.innerText = name;
    const buttonsElement = createPeerControlButtonsElement(onStart, onStop);
    element.appendChild(nameElement);
    element.appendChild(buttonsElement);
    return element;
}

function createPeerControlButtonsElement(onStart, onStop) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "pc-peer-btn-container";
    const startButton = createButton("Start", onStart);
    startButton.className = "pc-peer-start-btn";
    const stopButton = createButton("Stop", onStop);
    stopButton.className = "pc-peer-stop-btn hidden";
    buttonContainer.appendChild(startButton);
    buttonContainer.appendChild(stopButton);
    return buttonContainer;
}

function createButton(content, onClick) {
    const button = document.createElement("button");
    button.onclick = onClick;
    button.innerHTML = content;
    return button;
}
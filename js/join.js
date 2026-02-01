import { sendMessage } from "./websocket.js";

const joinForm = document.getElementById("join-form");
const loadingElement = document.getElementById("loading");
const nameInput = document.getElementById("name-input");
const passwordInput = document.getElementById("password-input");
const roomInput = document.getElementById("room-input");
const nameInputContainer = document.getElementById("name-input-container");
const passwordInputContainer = document.getElementById("password-input-container");
const roomInputContainer = document.getElementById("room-input-container");
const roomSubmitButton = document.getElementById("submit-room-btn");

const JoinState = {
    NAME: [nameInputContainer, nameInput],
    PASSWORD: [passwordInputContainer, passwordInput],
    ROOM: [roomInputContainer, roomInput]
}
var shouldCreateRoom = false;
var joinState = JoinState.NAME;

const urlPathName = window.location.pathname;
const pathNodes = urlPathName.substring(1).split("/");
if (pathNodes.length === 1) {
    const potRoomID = pathNodes[0];
    if (potRoomID.length === 4 && !isNaN(parseInt(potRoomID))) {
        roomInput.value = potRoomID;
    }
}

roomInput.onkeyup = (e) => {
    const value = e.target.value;
    roomSubmitButton.disabled = value.length !== 4;
}

joinForm.onsubmit = (e) => {
    switch (joinState) {
        case JoinState.NAME:
            e.preventDefault();
            if (nameInput.value === "") return;
            setJoinState(roomInput.value ? JoinState.PASSWORD : JoinState.ROOM);
            break;
        case JoinState.PASSWORD:
            e.preventDefault();
            shouldCreateRoom ? createRoom() : joinRoom();
            break;
        case JoinState.ROOM:
            e.preventDefault();
            shouldCreateRoom = false;
            setJoinState(JoinState.PASSWORD);
            break;
        default:
            break;
    }
}

document.getElementById("create-room-btn").onclick = (e) => {
    e.preventDefault();
    shouldCreateRoom = true;
    setJoinState(JoinState.PASSWORD);
}

function setJoinState(state) {
    setLoading(false);
    nameInputContainer.classList.add("hidden");
    passwordInputContainer.classList.add("hidden");
    roomInputContainer.classList.add("hidden");
    state[0].classList.remove("hidden");
    state[1].focus();
    joinState = state;
}

function setLoading(loading) {
    joinForm.classList.toggle("hidden", loading);
    loadingElement.classList.toggle("hidden", !loading);
}

function createRoom() {
    setLoading(true);
    sendMessage("create_room", {password: passwordInput.value, name: nameInput.value});
}

function joinRoom() {
    setLoading(true);
    sendMessage("join_room", {id: roomInput.value, password: passwordInput.value, name: nameInput.value});
}

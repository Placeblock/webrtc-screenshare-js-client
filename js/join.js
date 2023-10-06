const nameInput = document.getElementById("name-input");
const passwordInput = document.getElementById("password-input");
const roomInput = document.getElementById("room-input");
const submitButton = document.getElementById("submit-btn");
const nameInputContainer = document.getElementById("name-input-container");
const passwordInputContainer = document.getElementById("password-input-container");
const roomInputContainer = document.getElementById("room-input-container");

const JoinState = {
    NAME: nameInputContainer,
    PASSWORD: passwordInputContainer,
    ROOM: roomInputContainer
}

var joinState = JoinState.NAME;

submitButton.onclick = (e) => {
    e.preventDefault();
    switch (joinState) {
        case JoinState.NAME:
            setJoinState(roomInput.value ? JoinState.PASSWORD : JoinState.ROOM);
            break;
        case JoinState.ROOM:
            setJoinState(JoinState.PASSWORD);
        case JoinState.PASSWORD:
            joinRoom();
        default:
            break;
    }
}

function setJoinState(state) {
    nameInputContainer.classList.add("hidden");
    passwordInputContainer.classList.add("hidden");
    roomInputContainer.classList.add("hidden");
    state.classList.remove("hidden");
}

function joinRoom() {
    //TODO: RESET INPUT
}

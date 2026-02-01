const joinStateElement = document.getElementById("join");
const connectionStateElement = document.getElementById("connection");
const roomStateElement = document.getElementById("room");

export const State = {
    CONNECTION: connectionStateElement,
    JOIN: joinStateElement,
    ROOM: roomStateElement,
}
var state = State.CONNECTION;

export function setState(newstate) {
    state = newstate;
    Object.getOwnPropertyNames(State).forEach(prop => {
        State[prop].classList.add("hidden");
    });
    state.classList.remove("hidden");
}
import { State, setState } from "./state.js";

const connectionStatusElement = document.getElementById("connection-status")

const WebSocketState = {
    CONNECTING: "Connecting",
    CONNECTED: "Connected",
    RECONNECTING: "Reconnecting",
    CLOSED: "Closed"
}

var socket;
var state = WebSocketState.CONNECTING;
var retries = 0;
var pingTimer = null;
const messageHandler = [];

export function registerMessageHandler(action, callback) {
    messageHandler.push([action, callback]);
}

export function sendMessage(action, data) {
    const message = {"data":data, "action":action};
    socket.send(JSON.stringify(message));
}

function setSocketState(newstate) {
    state = newstate;
    updateInfo();
}

function connect() {
    socket = new WebSocket("wss://stream.codelix.de/wss");
    socket.onopen = onOpen;
    socket.onmessage = onMessage;
    socket.onclose = onClose;
}

function reconnect() {
    retries++;
    setSocketState(WebSocketState.RECONNECTING);
    connect();
}

function onClose() {
    setState(State.CONNECTION);
    if (retries <= 10) {
        setTimeout(reconnect, 5000);
    } else {
        setSocketState(WebSocketState.CLOSED);
    }
}

function onOpen() {
    retries = 0;
    setSocketState(WebSocketState.CONNECTED);
    startPingTimer();
    setState(State.JOIN);
}

function onMessage(e) {
    if (e.data === "pong") return;
    try {
        const message = JSON.parse(e.data);
        for (let i of messageHandler) {
            if (i[0] === message["action"]) {
                i[1](message["data"]);
            }
        }
    } catch (error) {
        console.error("Invalid Message received:")
        console.log(e.data);
        console.log(error);
    }
}

function startPingTimer() {
    if (pingTimer !== null) {
        clearInterval(pingTimer);
    }
    pingTimer = setInterval(() => {
        socket.send("ping");
    }, 120000);
}

function updateInfo() {
    const retriesText = " (" + retries + ")";
    const showRetries = state === WebSocketState.RECONNECTING;
    connectionStatusElement.innerText = state + (showRetries?retriesText:"");
}
connect();

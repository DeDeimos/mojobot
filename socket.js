import { fadeToAction, createGUI } from "./scene.js";

const socket = io("http://185.204.2.233:3030/");

function connectToStation() {
  console.log("Connecting to station...");
  const host = document.getElementById("host").value;
  socket.emit("connectToStation", host);
}

function disconnectFromStation() {
  console.log("Disconnecting from station...");
  socket.emit("disconnectFromStation");
}

function moveForward() {
  console.log("move Forward...");
  socket.emit("moveForward");
}

function moveRight() {
  console.log("move Right...");
  socket.emit("moveRight");
}

function moveLeft() {
  console.log("move Left...");
  socket.emit("moveLeft");
}

function moveBack() {
  console.log("move back...");
  socket.emit("moveBack");
}

function turnRight() {
  console.log("turn right...");
  socket.emit("turnRight");
}

function turnLeft() {
  console.log("turn left...");
  socket.emit("turnLeft");
}

function heal() {
  fadeToAction("ThumbsUp", 0.2);
  console.log("healing");
  socket.emit("heal");
}

function changeMode() {
  console.log("changing mode");
  socket.emit("changeMode");
}

function fixCriticalError() {
  socket.emit("fixing CriticalError");
  socket.emit("fixCriticalError");
}

function restart() {
  console.log("restarting...");
  socket.emit("restart");
}

socket.on("state", (state) => {
    console.log(state)
    // updateData(state)
});

socket.on("connect", () => console.log("connected to ЦУП"));

socket.on('message', (data) => console.log('Message received: ' + data));

socket.on("temperature", (temperature) => {});

socket.on("health", (health) => {});

socket.on("dead", () => {});

socket.on("criticalError", (criticalError) => {});

socket.on("fixCriticalError", () => {});

socket.on("action", (action) => {
  fadeToAction(action, 0.2);
});

socket.on("emote", (emote) => {
  fadeToAction(emote, 0.2);
});

socket.on("expression", (expression) => {});

socket.on("mode", (mode) => {});

document
  .getElementById("moveForwardButton")
  .addEventListener("click", moveForward);

document.getElementById("moveBackButton").addEventListener("click", moveBack);

document.getElementById("moveRightButton").addEventListener("click", moveRight);

document.getElementById("moveLeftButton").addEventListener("click", moveLeft);

document.getElementById("turnRightButton").addEventListener("click", turnRight);

document.getElementById("turnLeftButton").addEventListener("click", turnLeft);

document.getElementById("healButton").addEventListener("click", heal);

document.getElementById("connect").addEventListener("click", connectToStation);

document
  .getElementById("disconnect")
  .addEventListener("click", disconnectFromStation);

document.getElementById("changeMode").addEventListener("click", changeMode);

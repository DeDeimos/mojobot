const socket = io();

function connectToStation() {
    console.log('Connecting to station...');
    const host = document.getElementById('host').value;
    socket.emit('connectToStation', host);
}

function disconnectFromStation() {
    console.log('Disconnecting from station...');
    socket.disconnect();
    console.log('Disconnected!');
}

function moveForward() {
    console.log('move Forward...');
    socket.emit('moveForward', );
}

function moveRight() {
    console.log('move Right...');
    socket.emit('moveRight', );
}

function moveLeft() {
    console.log('move Left...');
    socket.emit('moveLeft', );
}

function moveBack() {
    console.log('move back...');
    socket.emit('moveBack', );
}

function turnRight() {
    console.log('turn right...');
    socket.emit('turnRight', );
}

function turnLeft() {
    console.log('turn left...');
    socket.emit('turnLeft', );
}

function heal() {
    console.log('healing');
    socket.emit('heal', );
}

function changeMode() {
    console.log('changing mode');
    socket.emit('changeMode', );
}

function fixCriticalError() {
    socket.emit('fixing CriticalError');
    socket.emit('fixCriticalError', );
}

function restart() {
    console.log('restarting...');
    socket.emit('restart', )
}

socket.on('state', (state) => {})

socket.on('temperature', (temperature) => {})

socket.on('health', (health) => {})

socket.on('dead', () => {})

socket.on('criticalError', (criticalError) => {})

socket.on('fixCriticalError', () => {})

socket.on('action', (action) => {})

socket.on('emote', (emote) => {})

socket.on('expression', (expression) => {})

socket.on('mode', (mode) => {})

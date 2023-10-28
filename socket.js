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
    socket.emit('heal', )
}

function changeMode() {
    console.log('changing mode')
    socket.emit('changeMode', )
}


const socket = io();

function connectToStation() {
    console.log('Connecting to station...');
    const host = document.getElementById('host').value;
    socket.emit('connect to station', host);
}

function disconnectFromStation() {
    console.log('Disconnecting from station...');
    socket.disconnect();
    console.log('Disconnected!');
}
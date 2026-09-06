const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

const realServer = http.createServer(app);

const io = new Server(realServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {

    socket.on('send_message', (message) => {
        console.log('recieved the message:', message)

        io.emit('receive_message', message);
    })

    socket.on('disconnect', () => {
        console.log('Client Disconnected', socket.id);
    })
})


realServer.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});


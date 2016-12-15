const path = require("path");

const auth = require("../routes/auth");
const socketioJwt = require('socketio-jwt');
const settings = require('../config.js');
const userData = require('../data/users.js');

const constructorMethod = (io) => {

    // we'll use the '/chatns' namespace
    const chatns = io.of('/chatns');
    const userSocketMap = {};

    /* client should do something like:
        var socket = io.connect('http://localhost:3000/chatns', {
            query: 'token=' + your_jwt,
            transports: [ 'websocket' ],
            'force new connection': true
        });
    */

    chatns.use(socketioJwt.authorize({
        secret: settings.serverConfig.sessionSecret,
        handshake: true
    }));

    chatns.on('connection', (socket) => {

        let username = socket.decoded_token.sub;

        console.log(`${username} has authenticated.`);

        socket.on('join-channel', (channelName) => {
            console.log(channelName);
            io.to(channelName).emit('user-join', username);
            socket.join(channelName);
        });

        socket.on('leave-channel', (channelName) => {
            io.to(channelName).emit('user-leave', username);
            socket.leave(channelName);
        });

        socket.on('send-msg', (msg) => {
            io.to(msg.channelName).emit('new-msg', {
                from: username,
                text: msg.text,
                ts: new Date().valueOf()
            });
        });

        socket.on('private-msg', (msg) => {
            if (userSocketMap[msg.to] !== undefined) {
                userSocketMap[msg.to].emit('pm', {
                    from: username,
                    text: msg.text,
                    ts: new Date().valueOf()
                });
            } else {
                userSocketMap[username].emit('err', {
                    error: 'No such user currently online'
                });
            }
        });

        socket.on('init', () => {
            userSocketMap[username] = socket;
        });

        socket.on('disconnect', () => {
            userSocketMap[username] = undefined;
        });

    });
};

module.exports = constructorMethod;
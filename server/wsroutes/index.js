const path = require("path");

const auth = require("../routes/auth");
const socketioJwt = require('socketio-jwt');
const settings = require('../config.js');

const xss = require("xss");

const constructorMethod = (io) => {

    // we'll use the '/chatns' namespace
    const chatns = io.of('/chatns');
    const userSocketMap = {};
    const channelUsers = {};
    const userChannels = {};

    /* client should do something like:
        var socket = io.connect('http://localhost:3000/chatns', {
            query: 'token=' + json_web_token,
            transports: [ 'websocket' ],
            'force new connection': true
        });
    */

    // auth middleware
    chatns.use(socketioJwt.authorize({
        secret: settings.serverConfig.sessionSecret,
        handshake: true
    }));

    // on each new connection from a websocket client
    chatns.on('connection', (socket) => {

        let username = xss(socket.decoded_token.sub);

        console.log(`${username} has authenticated.`);

        /* supported user commands */

        socket.on('join-channel', (channelName) => {
            io.to(channelName).emit('user-join', username);
            socket.join(channelName);
            if (channelUsers[channelName] === undefined) {
                channelUsers[channelName] = new Set();
            }
            if (userChannels[username] === undefined) {
                userChannels[username] = new Set();
            }
            channelUsers[channelName].add(username);
            userChannels[username].add(channelName);
            console.log(`${username} has joined channel ${channelName}`);
        });

        socket.on('leave-channel', (channelName) => {
            io.to(channelName).emit('user-leave', username);
            socket.leave(channelName);
            /* update list of channel users */
            channelUsers[channelName].delete(username)
            userChannels[username].delete(channelName);
            console.log(`${username} has left channel ${channelName}`);
        });

        socket.on('send-msg', (msg) => {
            io.to(msg.channelName).emit('new-msg', {
                from: username,
                text: xss(msg.text),
                ts: new Date().valueOf()
            });
        });

        socket.on('private-msg', (msg) => {
            if (userSocketMap[msg.to] !== undefined) {
                userSocketMap[msg.to].emit('pm', {
                    from: username,
                    text: xss(msg.text),
                    ts: new Date().valueOf()
                });
            } else {
                userSocketMap[username].emit('err', {
                    error: 'No such user currently online'
                });
            }
        });

        /* used by portions of frontend */

        socket.on('user-list', (channelName) => {
            io.to(userSocketMap[username]).emit('channel-users', {
                channel: channelName,
                users: Array.from(channelUsers[channelName])
            });
        });

        socket.on('channel-list', () => {
            io.to(userSocketMap[username]).emit('channels', {
                channels: Object.keys(channelUsers)
            });
        });

        socket.on('joined-channels', () => {
            io.to(userSocketMap[username]).emit('your-channels', {
                channels: userChannels[username]
            });
        })

        /* configuration for client connect/disconnect */

        socket.on('init', () => {
            userSocketMap[username] = socket;
            console.log(`Created user:socket mapping for ${username}`);
        });

        socket.on('disconnect', () => {
            userSocketMap[username] = undefined;
            userChannels[username].forEach( (chan) => {
                channelUsers[chan].delete(username);
            });
            // userChannels[username].clear();
            userChannels[username] = undefined;
            console.log(`${username} has disconnected`);
        });

    });
};

module.exports = constructorMethod;
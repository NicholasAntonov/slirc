const socketioJwt = require('socketio-jwt');
const settings = require('../config.js');
const xss = require('xss');

const constructorMethod = (io) => {

    // we'll use the '/chatns' namespace
    const chatns = io.of('/chatns');
    
    const userSocketMap = {};
    const channelUsers = {};
    const userChannels = {};
    let username = undefined;
    
    /* supported user commands */
    
    const join_channel = (socket, channelName) => {
        io.to(channelName).emit('action', {
            type: 'user-join',
            channel: channelName,
            username: username
        });
        socket.join(channelName);
        if (channelUsers[channelName] === undefined) {
            channelUsers[channelName] = new Set();
        }
        if (userChannels[username] === undefined) {
            userChannels[username] = new Set();
        }
        channelUsers[channelName].add(username);
        userChannels[username].add(channelName);
        // console.log(`${username} has joined channel ${channelName}`);
    };
    
    const leave_channel = (socket, channelName) => {
        io.to(channelName).emit('action', {
            type: 'user-leave',
            channel: channelName,
            username: username
        });
        socket.leave(channelName);
        /* update list of channel users */
        channelUsers[channelName].delete(username);
        userChannels[username].delete(channelName);
        // console.log(`${username} has left channel ${channelName}`);
    };

    const send_msg = (msg) => {
        io.to(msg.channelName).emit('action', {
            type: 'new-msg',
            channel: msg.channelName,
            from: username,
            text: xss(msg.text),
            ts: new Date().valueOf()
        });
    };

    const private_msg = (msg) => {
        if (userSocketMap[msg.to] !== undefined) {
            userSocketMap[msg.to].emit('action', {
                type: 'pm',
                from: username,
                text: xss(msg.text),
                ts: new Date().valueOf()
            });
        } else {
            userSocketMap[username].emit('err', {
                error: 'No such user currently online'
            });
        }
    };

    /* used by portions of frontend */
    
    const user_list = (channelName) => {
        io.to(userSocketMap[username]).emit('action', {
            type: 'channel-users',
            channel: channelName,
            users: Array.from(channelUsers[channelName])
        });
    };
    
    const channel_list = () => {
        io.to(userSocketMap[username]).emit('action', {
            type: 'channel-list',
            channels: Object.keys(channelUsers)
        });
    };
    
    const joined_channels = () => {
        io.to(userSocketMap[username]).emit('action', {
            type: 'joined-channels',
            channels: userChannels[username]
        });
    };   

    /* client should do something like:
        var socket = io.connect('http://localhost:3000/chatns', {
            query: 'token=' + json_web_token,
            transports: [ 'websocket' ],
            'force new connection': true
        });
    */

    // auth middleware
    /* chatns.use(socketioJwt.authorize({
        secret: settings.serverConfig.sessionSecret,
        handshake: true
    }));
    */

    // on each new connection from a websocket client
    chatns.on('connection', socketioJwt.authorize({
        secret: settings.serverConfig.sessionSecret
    })).on('authenticated', (socket) => {

        username = xss(socket.decoded_token.sub);

        // console.log(`${username} has authenticated.`);
        
        socket.on('action', (action) => {
            let type = action.type;
            
            if (type === 'join-channel') {
                join_channel(socket, action.data.channelName);
            } else if (type === 'leave-channel') {
                leave_channel(socket, action.data.channelName);
            } else if (type === 'send-msg') {
                send_msg(action.data.msg);
            } else if (type === 'private-msg') {
                private_msg(action.data.msg);
            } else if (type === 'user-list') {
                user_list(action.data.channelName);
            } else if (type === 'channel-list') {
                channel_list();
            } else if (type === 'joined-channels') {
                joined_channels();
            } else {
                socket.emit('err', {'err' : 'invalid command'});
            }
        });

        /* configuration for client connect/disconnect */

        socket.on('init', () => {
            userSocketMap[username] = socket;
            // console.log(`Created user:socket mapping for ${username}`);
        });

        socket.on('disconnect', () => {
            userSocketMap[username] = undefined;
            userChannels[username].forEach( (chan) => {
                channelUsers[chan].delete(username);
            });
            // userChannels[username].clear();
            userChannels[username] = undefined;
            // console.log(`${username} has disconnected`);
        });

    });
};

module.exports = constructorMethod;

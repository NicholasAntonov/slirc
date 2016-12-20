const jwt = require('jsonwebtoken');
const settings = require('../config.js');
const xss = require('xss');
const auth = require('../routes/auth.js');

const verifyToken = (token) => {
    let decoded = undefined;

    if (!token) {
        return undefined;
    }

    try {
        decoded = jwt.verify(token, settings.serverConfig.sessionSecret);
    } catch (e) {
        return undefined;
    }

    return decoded.sub;
}

const constructorMethod = (io) => {

    // we'll use the '/chatns' namespace
    const chatns = io.of('/chatns');

    const userSocketMap = {};
    const channelUsers = {};
    const userChannels = {};

    /* supported user commands */

    const join_channel = (socket, username, channelName) => {
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

    const leave_channel = (socket, username, channelName) => {
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

    const send_msg = (username, msg) => {
        io.to(msg.channelName).emit('action', {
            type: 'new-msg',
            channel: msg.channelName,
            from: username,
            text: xss(msg.text),
            ts: new Date().valueOf()
        });
        console.log('sending message', username, msg.text);
    };

    const private_msg = (username, msg) => {
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
    
    const user_list = (username, channelName) => {
        io.to(userSocketMap[username]).emit('action', {
            type: 'channel-users',
            channel: channelName,
            users: Array.from(channelUsers[channelName])
        });
    };

    const channel_list = (username) => {
        io.to(userSocketMap[username]).emit('action', {
            type: 'channel-list',
            channels: Object.keys(channelUsers)
        });
    };

    const joined_channels = (username) => {
        io.to(userSocketMap[username]).emit('action', {
            type: 'joined-channels',
            channels: userChannels[username]
        });
    };

    // on each new connection from a websocket client
    chatns.on('connection', (socket) => {

        console.log('connected');

        socket.on('action', (action) => {
            let username = verifyToken(action.token);
            
            if (!username) {
                console.log('unauthorized');
                socket.emit('unauthorized', {message: 'invalid token'});
            } else {
                let type = action.type;
                
                console.log(`${username} has authenticated.`);
                console.log(action);

                if (type === 'join-channel') {
                    join_channel(socket, username, action.channelName);
                } else if (type === 'leave-channel') {
                    leave_channel(socket, username, action.channelName);
                } else if (type === 'send-msg') {
                    send_msg(username, action.msg);
                } else if (type === 'private-msg') {
                    private_msg(username, action.msg);
                } else if (type === 'user-list') {
                    user_list(username, action.channelName);
                } else if (type === 'channel-list') {
                    channel_list(username);
                } else if (type === 'joined-channels') {
                    joined_channels(username);
                } else {
                    socket.emit('err', {'err' : 'invalid command'});
                }
            }
        });

        /* configuration for client connect/disconnect */

        socket.on('init', () => {
            console.log('init');
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

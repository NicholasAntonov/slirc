var MongoClient = require('mongodb').MongoClient,
    settings = require('../config.js'),
    uuid = require('uuid'),
    redis = require('promise-redis')(),
    redisClient = redis.createClient(),
    bcrypt = require("bcrypt-nodejs");

var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl).then(function(db) {
        var userCollection = db.collection("users");

        /**
         * Create a user
         */
        exports.createUser = (username, password) => {
            if (!username || !password) {
                return Promise.reject("Invalid parameters");
            }

            username = username.trim();
            password = password.trim();

            if (!username || !password) {
                return Promise.reject("Invalid parameters");
            }

            return exports.getUserByUsername(username).then((user) => {
                if (user) {
                    return Promise.reject("User already exists");
                }

                let salt = bcrypt.genSaltSync();
                let userObject = {
                    _id: uuid.v4(),
                    username: username,
                    password: bcrypt.hashSync(password, salt),
                    sessionID: null
                }

                return userCollection.insertOne(userObject).then((res) => {
                    return res;
                });
            })
        }

        /**
         * Authenticate a user
         */
        exports.authenticateUser = (username, password, token) => {
            if (!username || !password || !token) {
                return Promise.reject("Invalid parameters");
            }

            return exports.getUserByUsername(username).then((foundUser) => {
                if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
                    let user = foundUser;

                    return userCollection.update({ username: username }, { $set: { sessionID: token }}).then(() => {
                        user.sessionID = token;
        
                        return redisClient.set(user._id, JSON.stringify(user)).then(() => {
                            return redisClient.set(user.username, JSON.stringify(user));
                        }).then(() => {
                            return token;
                        });
                    });
                } else {
                    return Promise.reject("Invalid username or password");
                }
            });
        }

        /**
         * Get a user by username
         */
        exports.getUserByUsername = (username) => {
            return redisClient.get(username).then((user) => {
                if (user) {
                    return JSON.parse(user);
                }

                return userCollection.findOne({ username: username }).then((foundUser) => {
                    user = foundUser ? foundUser : null;

                    if (user) {
                        redisClient.set(username, JSON.stringify(user));
                        redisClient.set(user._id, JSON.stringify(user));
                    }

                    return user;
                });
            })
        }

        /**
         * Log a user out
         */
        exports.logout = (username) => {
            return exports.getUserByUsername(username).then((user) => {
                redisClient.del(username);
                redisClient.del(user._id);
                return userCollection.update({ username: username }, { $set: { sessionID: null }});
            });
        }
    });
var MongoClient = require('mongodb').MongoClient,
    settings = require('../config.js'),
    uuid = require('uuid'),
    redis = require('promise-redis')(),
    redisClient = redis.createClient(),
    bcrypt = require("bcrypt-nodejs"),
    xss = require("xss");

var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl).then(function(db) {
        var userCollection = db.collection("users");

        /**
         * Create a user
         */
        exports.createUser = (username, password, bio) => {
            if (!username || !password) {
                return Promise.reject("Invalid parameters");
            }

            username = xss(username.trim());
            password = password.trim();
            bio = !bio || !bio.trim() ? null : xss(bio.trim());

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
                    bio: bio,
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
         * Get a user by ID
         */
        exports.getUserByID = (id) => {
            return redisClient.get(id).then((user) => {
                if (user) {
                    return JSON.parse(user);
                }

                return userCollection.findOne({ _id: id }).then((foundUser) => {
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
         * Update a user
         */
        exports.updateUser = (id, username, password, bio) => {
            return exports.getUserByID(id).then((oldUser) => {
                let updateSet = {};

                if (!oldUser) {
                    return Promise.reject("Invalid user ID");
                }

                username = username ? xss(username.trim()) : oldUser.username;

                return exports.getUserByUsername(username).then((user) => {
                    if (user && username != oldUser.username) {
                        return Promise.reject("New username is already in use");
                    } else {
                        username = username ? username : oldUser.username;
                    }

                    if (password && (password = password.trim())) {
                        let salt = bcrypt.genSaltSync();
                        password = bcrypt.hashSync(password, salt);
                    } else {
                        password = oldUser.password;
                    }

                    if (bio && (bio = bio.trim())) {
                        bio = xss(bio);
                    } else {
                        bio = oldUser.bio;
                    }

                    let updateSet = {
                        _id: id,
                        username: username,
                        password: password,
                        bio: bio,
                        sessionID: null
                    };

                    return userCollection.update({ _id: id }, updateSet).then(() => {
                        return redisClient.set(id, JSON.stringify(updateSet));
                    }).then(() => {
                        return (username == oldUser.username) ? 1 : redisClient.del(oldUser.username);
                    }).then(() => {
                        return redisClient.set(username, JSON.stringify(updateSet));
                    });
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

        /**
         * Delete a user
         */
        exports.delete = (username) => {
            return exports.getUserByUsername(username).then((user) => {
                redisClient.del(username);
                redisClient.del(user._id);
                return userCollection.deleteOne({ username: username });
            });
        }
    });
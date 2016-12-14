var rethink = require('rethinkdb'),
    settings = require('../config.js'),
    uuid = require('uuid'),
    redis = require('promise-redis')(),
    redisClient = redis.createClient(),
    bcrypt = require("bcrypt-nodejs"),
    xss = require("xss");

var exports = module.exports = {};

rethink.connect(settings.rethink).then((db) => {
        var userCollection = rethink.table("users");

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
                console.log(user);
                if (user) {
                    return Promise.reject("User already exists");
                }

                let salt = bcrypt.genSaltSync();
                let userObject = {
                    id: uuid.v4(),
                    username: username,
                    password: bcrypt.hashSync(password, salt),
                    bio: bio,
                    sessionID: null
                }

                return userCollection.insert(userObject).run(db).then((res) => {
                    return res;
                }).error((err) => {
                    console.log(err);
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
                    var user = foundUser;

                    return userCollection.filter({ username: username }).update({ sessionID: token }).run(db).then(() => {
                        user.sessionID = token;
        
                        return redisClient.set(user.id, JSON.stringify(user)).then(() => {
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

                return userCollection.filter({ username: username }).limit(1).run(db).then((foundUser) => {
                    return foundUser.toArray();
                }).then((foundUser) => {
                    user = foundUser[0] ? foundUser[0] : null;

                    if (user) {
                        redisClient.set(username, JSON.stringify(user));
                        redisClient.set(user.id, JSON.stringify(user));
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

                return userCollection.get(id).then((foundUser) => {
                    user = foundUser ? foundUser : null;

                    if (user) {
                        redisClient.set(username, JSON.stringify(user));
                        redisClient.set(user.id, JSON.stringify(user));
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
                        id: id,
                        username: username,
                        password: password,
                        bio: bio,
                        sessionID: null
                    };

                    return userCollection.get(id).update(updateSet).run(db).then(() => {
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
                redisClient.del(user.id);
                return userCollection.filter({ username: username }).update({ sessionID: null }).run(db);
            });
        }

        /**
         * Delete a user
         */
        exports.delete = (username) => {
            return exports.getUserByUsername(username).then((user) => {
                redisClient.del(username);
                redisClient.del(user.id);
                return userCollection.filter({ username: username }).delete().run(db);
            });
        }
    });
const express = require('express');
const router = express.Router();
const userData = require('../data/users.js');
const auth = require('./auth.js');
const jwt = require('jsonwebtoken');
const settings = require('../config.js');

router.post("/create", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let bio = req.body.bio;

    userData.createUser(username, password, bio).then((data) => {
        res.json({ success: true, message: "User created" })
    }).catch((err) => {
        res.json({ success: false, message: err });
    });
});

router.post("/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
        res.json({ success: false, message: "Invalid parameters" });
        return;
    }

    username = username.trim();
    password = password.trim();

    userData.getUserByUsername(username).then((user) => {
        if (!user) {
            return Promise.reject("Invalid username or password");
        }
        
        return jwt.sign({ sub: user.username }, settings.serverConfig.sessionSecret);
    }).then((token) => {
        return userData.authenticateUser(username, password, token);
    }).then((token) => {
        res.json({ success: true, token: token });
    }).catch((err) => {
        res.json({ success: false, message: err });
    });
});

router.post("/logout", auth.verifyRequest(), (req, res) => {
    userData.logout(res.locals.user.username).then(() => {
        res.json({ success: true, message: "Logged out" });
    }).catch((err) => {
        res.json({ success: false, message: err });
    });
});

router.put("/", auth.verifyRequest(), (req, res) => {
    
});

router.delete("/", auth.verifyRequest(), (req, res) => {
    userData.delete(res.locals.user.username).then(() => {
        res.json({ success: true, message: "User deleted" });
    }).catch((err) => {
        res.json({ success: false, message: err });
    });
});

// Capture any other uncoded routes and 404 them
router.use("*", (req, res) => {
    res.status(404).send({ success: false, message: "Not found" });
});

module.exports = router;
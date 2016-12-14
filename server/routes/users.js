const express = require('express');
const router = express.Router();
const data = require('../data/users.js');
const auth = require('./auth.js');
const jwt = require('jsonwebtoken');
const settings = require('../config.js');

router.post("/create", (req, res) => {

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

        return jwt.sign({ sub: user.username }, settings.sessionSecret);
    }).then((token) => {
        return userData.authenticateUser(username, password, token);
    }).then((token) => {
        res.json({ success: true, token: token });
    }).catch((err) => {
        res.json({ success: false, message: err });
    });
});

router.post("/logout", auth.verifyRequest(), (req, res) => {

});

router.put("/:id", auth.verifyRequest(), (req, res) => {

});

router.delete("/:id", auth.verifyRequest(), (req, res) => {

});

// Capture any other uncoded routes and 404 them
router.use("*", (req, res) => {
    res.status(404).send({ "success": false, "message": "Not found" });
});

module.exports = router;
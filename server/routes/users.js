const express = require('express');
const router = express.Router();
const data = require('../data/users.js');

router.post("/create", (req, res) => {

});

router.post("/login", (req, res) => {

});

router.post("/logout", (req, res) => {

});

router.put("/:id", (req, res) => {

});

router.delete("/:id", (req, res) => {

});

// Capture any other uncoded routes and 404 them
router.use("*", (req, res) => {
    res.sendStatus(404);
});

module.exports = router;
const express = require('express');
const router = express.Router();

// Capture any other uncoded routes and 404 them
router.use("*", (req, res) => {
    res.sendStatus(404);
});

module.exports = router;
const express = require('express');
const router = express.Router();

// Capture any other uncoded routes and 404 them
router.use("*", (req, res) => {
    res.status(404).send({ success: false, message: "Not found" });
});

module.exports = router;
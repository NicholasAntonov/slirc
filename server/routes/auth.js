var exports = module.exports = {};
const jwt = require("jsonwebtoken");
const settings = require('../config.js');
const userData = require('../data/users.js');

exports.verifyToken = (req) => {
    let decoded = undefined;
    const token = req.get('Auth-Token');

    try {
        decoded = jwt.verify(token, settings.serverConfig.sessionSecret);
    } catch (e) {
        return false;
    }

    return decoded.sub;
};

exports.verifyRequest = () => {
    return (req, res, next) => {
        const token = req.get('Auth-Token');
        const username = exports.verifyToken(req);

        if (username === false) {
            res.status(401).send({ success: false, message: "Unauthorized" });
        } else {
            userData.getUserByUsername(username).then((user) => {
                if (!user || user.sessionID != token) {
                    res.status(401).send({ success: false, message: "Unauthorized" });
                } else {
                    res.locals.user = user;
                    next();
                }
            }).catch((err) => {
                res.status(401).send({ success: false, message: "Unauthorized" });
            });
        }
    };
};
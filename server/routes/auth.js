var exports = module.exports = {};
const jwt = require("jsonwebtoken");
const settings = require('../config.js');
const userData = require('../data/users.js');

exports.verifyToken = (req) => {
    let token = req.get('Auth-Token');
    let decoded = undefined;

    try {
        decoded = jwt.verify(token, settings.serverConfig.sessionSecret);
    } catch (e) {
        console.log(e);
        return false;
    }

    return decoded.sub;
}

exports.verifyRequest = () => {
    return (req, res, next) => {
        let token = req.get('Auth-Token');
        let username = exports.verifyToken(req);
    
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
    }
};
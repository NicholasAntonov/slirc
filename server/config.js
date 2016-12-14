var exports = module.exports = {};

exports.rethink = {
    host: "127.0.0.1",
    port: 28015,
    db: "slirc"
};

exports.serverConfig = {
    port: 3000, // TODO: Use this in server.js
    sessionSecret: "somesupersecretkey" // Used for generating auth tokens
}

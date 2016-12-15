var exports = module.exports = {};

exports.rethink = {
    host: "127.0.0.1",
    port: 28015,
    db: "slirc"
};

exports.serverConfig = {
    port: 3000, 
    sessionSecret: "somesupersecretkey" // Used for generating auth tokens
}

var exports = module.exports = {};

exports.rethink = {
    host: "127.0.0.1", // Rethink IP
    port: 28015, // Rethink port
    db: "slirc" // Rethink database
};

exports.serverConfig = {
    port: 3000, // What port should express listen on?
    sessionSecret: "somesupersecretkey" // Used for generating auth tokens. Should be something secure
}

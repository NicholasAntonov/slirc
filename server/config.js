var exports = module.exports = {};

exports.mongoConfig = {
    serverUrl: "mongodb://localhost:27017/",
    database: "slirc",
    port: 8080, // TODO: Use this in server.js
    sessionSecret: "somesupersecretkey" // Used for generating auth tokens
};

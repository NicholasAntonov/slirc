const userRoutes = require("./users");
const messagesRoutes = require("./messages");
const path = require("path");

const constructorMethod = (app) => {
    app.use("/user", userRoutes);
    app.use("/message", messagesRoutes);

    app.use("*", (req, res) => {
        res.sendFile(path.resolve("server", "public", "html", "index.html"));
    });
};

module.exports = constructorMethod;
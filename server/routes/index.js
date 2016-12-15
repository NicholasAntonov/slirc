const userRoutes = require("./users");
const messageRoutes = require("./messages");
const path = require("path");

const constructorMethod = (app) => {
    app.use("/user", userRoutes);
    // app.use("/message", messageRoutes);

    app.use("*", (req, res) => {
        res.status(404).send({ success: false, message: "Not found" });
    });

};

module.exports = constructorMethod;
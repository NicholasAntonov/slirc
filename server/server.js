const bodyParser = require("body-parser");
const app = require("express")();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const rethink = require("rethinkdb");

const config = require("./config.js");
const expressPort = config.serverConfig.port;

const configRoutes = require("./routes");
const configWebSockets = require('./wsroutes');

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    next();
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

// setup frontend/webapp routes
configRoutes(app);

// setup socket.io stuff
configWebSockets(io);

start = () => {
    http.listen(expressPort, () => {
        console.log("We've now got a server!");
        console.log("Your routes will be running on http://localhost:3000");
    });
}

// Configure rethink
rethink.connect(config.rethink, (err, conn) => {
    if (err) {
        console.log("Unable to connect to rethink because: ");
        console.log(err);
        process.exit(1);
    }

    rethink.table("users").run(conn).then((err, result) => {
        console.log("Database already setup. Starting express...");
        start();
    }).error((err) => {
        console.log("Database not setup. Configuring database...");
        rethink.dbCreate(config.rethink.db).run(conn).finally(() => {
            return rethink.tableCreate("users").run(conn);
        }).then(() => {
            console.log("Database setup. Starting express...");
            start();
            conn.close();
        }).error((err) => {
            if (err) {
                console.log("An error occured:");
                console.log(err);
                process.exit(1);
            }

            console.log("Database already setup. Starting express...");
            start();
            conn.close();
        });
    });
});
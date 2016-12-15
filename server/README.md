slirc server
============
The server portion of slirc

Technologies used
-----------------
* Express - Webserver backend
* socketio - Live communication between clients and server
* redis - User data caching
* RethinkDB - User data storage
* yarn - Dependency management

Usage
-----
* Install and run [rethinkdb](https://rethinkdb.com/), and install [yarn](https://yarnpkg.com/).
* Run `yarn install`.
* Edit `config.js` to your liking.
* Run `yarn start`. The server will automatically setup the tables in the database, and will start running on `localhost:PORT` as defined in `config.js`.

User Routes
------
| Method | Endpoint       | Auth | Params (italics = optional)   | Description             |
| ------ | -------------- | ---- | ----------------------------- | ----------------------- |
| POST   | `/user/create` | No   | username, password, *bio*     | Create a user           |
| POST   | `/user/login`  | No   | username, password            | Request an auth token   |
| POST   | `/user/logout` | Yes  | -                             | Logout                  |
| GET    | `/user`        | Yes  | -                             | Get a user's bio        |
| PUT    | `/user`        | Yes  | *username*, *password*, *bio* | Update your information |
| DELETE | `/user`        | Yes  | -                             | Delete your account     |

* The authorization token must be in the `Auth-Token` header for routes that require auth. Otherwise, 401 Unauthorized will be returned.
* `PUT /user` will *always* log you out (destroy the auth token).
var MongoClient = require('mongodb').MongoClient,
    settings = require('../config.js'),
    uuid = require('uuid');

var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl)
    .then(function(db) {
        var userCollection = db.collection("users");
    });
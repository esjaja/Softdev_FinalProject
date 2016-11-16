var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser());
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));

mongoose.connect("mongodb://localhost/softdevDB");
var db = mongoose.connection;
db.on("error",console.error.bind(console,"console error:"));
db.once('open',function (callback) {
  console.log("Mongodb open");
});

//require controllers

// APIS
//app.get('/', 'to fill in');

app.listen(8080, () => {
  console.log("Start listening on " + 8080);
});

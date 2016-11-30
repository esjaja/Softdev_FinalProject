var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//var redisStore = require('connect-redis')(session);
var expressValidator = require('express-validator');
var mongoose = require('mongoose');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'somesecrettoken',
    name: 'softdev'
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use('/semantic', express.static(path.join(__dirname, 'semantic')));
app.use('/public', express.static(path.join(__dirname, 'public')));

//mongoose.connect("mongodb://localhost/softdevDB");
mongoose.connect('mongodb://softdev:softdev@ds157487.mlab.com:57487/softdev_db');
var db = mongoose.connection;
db.on("error", console.error.bind(console,"console error:"));
db.once('open',function (callback) {
  console.log("Mongodb open");
});

//require controllers
var UserCtrl = require('./controller/UserCtrl.js');
var ActivityCtrl = require('./controller/ActivityCtrl.js');
var UserCtrl = require('./controller/UserCtrl.js');
// APIS
app.get('/', UserCtrl.display_login);
app.get('/logout', UserCtrl.logout);
app.get('/index', ActivityCtrl.display_index);
app.get('/activity', ActivityCtrl.display_activity);
app.all('/login', UserCtrl.login);
app.post('/create_activity', ActivityCtrl.create_activity);


// error handler
/*app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});*/

app.listen(8080, () => {
  console.log("Start listening on " + 8080);
});

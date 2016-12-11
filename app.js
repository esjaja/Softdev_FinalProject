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
var multiparty = require('connect-multiparty')();
var assert = require('assert');
var fs = require('fs');
var Gridfs = require('gridfs-stream');
var loop = require('node-while-loop');

var app = express();
var router = express.Router();

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

//Connect the GridFS stream service to the existing mongo driver and database instance created when you start your app
var database = db.db;
var mongoDriver = mongoose.mongo;
var gfs = new Gridfs(database, mongoDriver);

//require controllers
var UserCtrl = require('./controller/UserCtrl.js');
var ActivityCtrl = require('./controller/ActivityCtrl.js');
var UserCtrl = require('./controller/UserCtrl.js');
var CheckUser = require('./middleware/CheckUser.js');
// APIS
app.get('/', UserCtrl.display_login);
app.get('/logout', UserCtrl.logout);
app.all('/login', UserCtrl.login);

app.use(CheckUser.check_login);
app.get('/index',ActivityCtrl.display_index);
app.get('/activity', ActivityCtrl.display_activity);

app.post('/create_activity', ActivityCtrl.create_activity);
app.post('/edit_activity_title', ActivityCtrl.edit_activity_title);
app.post('/edit_activity_description', ActivityCtrl.edit_activity_description);
app.post('/edit_activity_dates', ActivityCtrl.edit_activity_dates);
app.post('/add_activity_member', ActivityCtrl.add_activity_member);

//router.post('/activity', multiparty, function(req, res){
db.once('open', function () {
  // To check if a file exists or not
  var options = {filename : 'I_NEED_YOU.mp3'}; //can be done via _id as well
  //var bool=true;
  gfs.exist(options, function (err, found) {
    if (err) return handleError(err);
    //console.log('File exists');
    if(found){
      gfs.remove({ filename: 'I_NEED_YOU.mp3' }, function (err) {
                if (err) return handleError(err);
                console.log('success');});
    }
    else {
      //bool=false;
      console.log('File does not exist');
    }
  });
  // Write to fs
  var writestream = gfs.createWriteStream({
    filename: 'I_NEED_YOU.mp3', // wait for edit the variable names: req.files.file.name
    mode: 'w',
    //content_type: req.files.file.mimetype,  // wait for edit the variable names
    //metadata: req.body
  });
  var readstream = fs.createReadStream('./I_NEED_YOU.mp3').pipe(writestream); // wait for edit the variable names: req.files.file.path
  writestream.on('data', function (chunk){
      console.log('Writing some data, just dont know what');
  });
  writestream.on('close', function (file) {
    console.log('Written file ' + file.filename);
  });
  writestream.on('error', function (err) {
     console.log('Got the following error: ' + err);
  });
  // show the gfs existing files
  gfs.files.find(/*{ filename: 'I_NEED_YOU.mp3' }*/).toArray(function (err, files) {
    if (err) {
         throw (err);
    }
    console.log(files);
  });
  // read from fs and show in response
  //readstream.pipe(res);
});

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

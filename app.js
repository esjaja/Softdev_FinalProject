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
var VoteCtrl = require('./controller/VoteCtrl.js');
var MessageCtrl = require('./controller/MessageCtrl.js');
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
app.post('/get_activities_month', ActivityCtrl.get_activities_month);
//app.post('/get_activity_date', ActivityCtrl.get_activity_date);

app.post('/remove_activity_member',ActivityCtrl.remove_activity_member);
app.post('/create_vote', VoteCtrl.create_vote);
app.post('/update_vote', VoteCtrl.update_vote);
app.post('/remove_option', VoteCtrl.remove_option);
app.post('/set_vote_date', VoteCtrl.set_vote_date);
app.post('/add_option', VoteCtrl.add_option);
app.post('/delete_vote', VoteCtrl.delete_vote);
app.post('/get_vote_one_day', VoteCtrl.get_vote_one_day);
app.post('/get_vote_event_date', VoteCtrl.get_vote_event_date);

app.post('/add_message', MessageCtrl.add_message);
app.post('/delete_message', MessageCtrl.delete_message);

//router.post('/activity', multiparty, function(req, res){
db.once('open', function () {
  // To check if a file exists or not
  var options = {filename : 'I_NEED_YOU.mp3'}; //can be done via _id as well
  //var bool=true;
  /*gfs.exist(options, function (err, found) {
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
  gfs.files.find(/*{ filename: 'I_NEED_YOU.mp3' }*///).toArray(function (err, files) {
    /*if (err) {
         throw (err);
    }
    console.log(files);
});*/
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

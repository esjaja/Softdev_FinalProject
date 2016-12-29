'use strict';
var fs = require('fs');
var Gridfs = require('gridfs-stream');
var mongoose = require('mongoose');
//Connect the GridFS stream service to the existing mongo driver and database instance created when you start your app
var db = mongoose.connection;
var database = db.db;
var mongoDriver = mongoose.mongo;
var gfs = new Gridfs(database, mongoDriver);

var parse_request = (req, res) => {
	//console.log('Receive Post http request');
    //console.log(req.files);
    // To check if a file exists or not
    if(req.body.case == "1"){
		//console.log('Case1.');
		var options = {filename : req.files.file.name}; //can be done via _id as well
		//var fakepath = {src:  req.files.file.path};
		//var bool=true;
		gfs.exist(options, function (err, found) {
			if (err) return handleError(err);
			//console.log('File exists');
			if(found){
				gfs.remove({ filename: req.files.file.name }, function (err) {
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
	       filename: req.files.file.name,
	       mode: 'w',
	       content_type: req.files.file.mimetype,
	       metadata: req.body
	    });
	    var readstream = fs.createReadStream(req.files.file.path).pipe(writestream);
	    writestream.on('data', function (chunk){
	        console.log('Writing some data, just dont know what');
	    });
	    writestream.on('close', function (file) {
	      console.log('Written file ' + file.filename);
	      // show the gfs existing files
	      gfs.files.find().toArray(function (err, files) {
	        if (err) {
	             throw (err);
	        }
	        //res.render('audioplayer', fakepath);
	        //console.log(files);
	        res.send(files);
	      });
    	});
    	writestream.on('error', function (err) {
	       console.log('Got the following error: ' + err);
	    });
	}
	else if(req.body.case == "2"){
		//console.log('Case2.');
		// show the gfs existing files
		gfs.files.find().toArray(function (err, files) {
			if (err) {
			   throw (err);
			}
			//res.render('audioplayer', fakepath);
			//console.log(files);
			res.send(files);
		});
	}
}

var access_music = (req, res) => {
    if(req.param('name') === 'favicon.ico') return res.json({});
	//console.log('Receive get http request for file.');
	var readstream = gfs.createReadStream({
	  filename: req.param('name')
	});
	readstream.pipe(res);
}

module.exports = {
    parse_request: parse_request,
    access_music: access_music
}

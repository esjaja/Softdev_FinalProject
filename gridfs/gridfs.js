var assert = require('assert');
var fs = require('fs');
var express = require('express');
var router = express.Router();
var multiparty = require('connect-multiparty')();
var mongoose = require('mongoose');
var Gridfs = require('gridfs-stream');

var uri = 'mongodb://softdev:softdev@ds157487.mlab.com:57487/softdev_db';

router.post('/activity', multiparty, function(req, res){
	//Connect the GridFS stream service to the existing mongo driver and database instance created when you start your app
	var db = mongoose.connection.db;
	var mongoDriver = mongoose.mongo;
	var gfs = new Gridfs(db, mongoDriver);
	var writestream = gfs.createWriteStream({
		filename: req.files.file.name,
		mode: 'w',
		content_type: req.files.file.mimetype,
		metadata: req.body
	});
	fs.createReadStream(req.files.file.path).pipe(writestream);
	writestream.on('close', function(file) {
		User.findById(req.params.id, function(err, user) {
			// handle error
			user.file = file._id;
			user.save(function(err, updatedUser) {
				// handle error
				return res.json(200, updatedUser)
			})
		});
		fs.unlink(req.files.file.path, function(err) {
			// handle error
			console.log('success!')
	  	});
	});
}
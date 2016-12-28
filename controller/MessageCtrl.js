'use strict';
var async = require('async');
var crypto = require('crypto');
var User = require('../model/User.js');
var Activity = require('../model/Activity.js');
var Message = require('../model/Message.js');

var add_message = (req, res, next) => {
    async.waterfall([
        (callback) => {
            let t = new Date();
            let md5 = crypto.createHash('md5');
            //console.log(t);
            //console.log(t.toISOString());
            let time = t.getFullYear() + "-" +(t.getMonth() + 1) + "-" + t.getDate() + " " + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
            let id = md5.update(t.getTime().toString() + req.session.user_id + req.body.activity_id).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            let message = new Message({
                id: id,
                activity_id: req.body.activity_id,
                user_id: req.session.user_id,
                time: time,
                content: req.body.message
            });
            message.save(message, (err, result) => {
                if(err || result === null){
                    console.log('Error: ' + err);
                }
                callback(null, id);
            });
        },
        (id, callback) => {
            User.findOne({id: req.session.user_id}, 'name', (err, user) => {
                callback(null, id, user.name);
            });
        }
    ], (err, id, name) => {
        return res.json({
            status: 200,
            id: id,
            user_id: req.session.user_id,
            user_name: name
        });
    });
}

var delete_message = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Message.remove({id: req.body.message_id}, (err) => {
                if(err) console.log('Error: ' + err);
                callback(null);
            });
        }
    ], (err, result) => {
        return res.json({
            status: 200
        });
    });
}

/*var get_message = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Activity.findOne({id: req.query.page}, (err, activity) => {
                if(err){
                    return console.log('Error: ' + err);
                }
                if(typeof activity === 'undefined' || activity === null){
                    return console.log('Unavailable Activity');
                }
                callback(null, activity)
        },
        (activity, callback) => {
            let ids = activity.user_id.toString();
            User.find({id: {$in: activity.user_id}}, 'id name',(err, users) => {
                if(err) return console.log('Error: ' + err);
                let new_user = {};
                users.forEach((user) => {
                    new_user[user.id] = user.name;
                });
                callback(null, activity, new_user);
            });
        },
        (activity, users, callback) => {
            //get messages
            Message.find({activity_id: activity.id}, null, {sort: {time: 1}}, (err, messages) => {
                if(err) return console.log('Error: ' + err);
                messages.forEach((mes) => {
                    mes.user_name = users[mes.user_id];
                });
                callback(null, activity, date, voting, voted, messages);
            });
        }
    ], (err, result) => {

    });
}*/


module.exports = {
    add_message: add_message,
    delete_message: delete_message
}

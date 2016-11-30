'use strict';
var User = require('../model/User.js');
var Activity = require('../model/Activity.js');
var Vote = require('../model/Vote.js');
var async = require('async');
var crypto = require('crypto');

var create_activity = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //for testing !!!
            if(typeof req.session.user_id === 'undefined' || req.session.user_id === null) req.session.user_id = "testing";

            let md5 = crypto.createHash('md5');
            let id = md5.update(new Date().getTime().toString() + req.session.user_id).digest('base64');
            let activity = new Activity({
                id: id,
                user_id: [req.session.user_id],
                title: "New Activity",
                date: [],
                description: "",
                vote_id: []
            });
            activity.save((err, result) => {
                if(err || result === null){
                    console.log('Error: ' + err);
                }
                callback(null, id);
            });
        },
        (activity_id, callback) => {
            User.update({id: req.session.user_id}, {
                $push: {
                    activity_id: activity_id
                }
            }, (err) => {
                if(err){
                    console.log('Error: ' + err);
                }
                callback(null);
            });
        }
    ], (err, result) => {
        if(err){
            console.log('Error: ' + err);
        }
        return res.redirect('/activity');
    });
}

var display_activity = (req, res, next) => {

    return res.render('activity');
}
var display_index = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //get the user's activity list
            User.find({id: req.session.user_id}, (err, user) => {
                if(err || user === null){
                    console.log('Error: ' + err);
                }
                callback(null, user[0].activity_id);
            });
        },
        (activity_id, callback) => {
            //get activities details
            Activity.find({id: {$in: activity_id}}, (err, activities) => {
                if(err || activities === null){
                    console.log('Error: ' + err);
                }
                let activities_new = activities.map((act) => {
                    let act_new ={
                        id: act.id,
                        title: act.title,
                        description: act.description
                    };
                    if(act.date.length > 0) act_new.date = act.date[0];
                    else act_new.date = "";
                    return act_new;
                });
                /*for(act in activities) {
                    let dt = act.date.map(
                    );
                }*/
                callback(null, activities_new);
            });
        }
    ], (err, activities) => {
        return res.render('index', {
            activities: activities
        });
    });
}
var edit_activity_title = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check activity_id is available
            Activity.find({id: req.body.activity_id}, (err, activities) => {
                if(err){
                    console.log('Error: ' + err);
                }
                if(activties.length !== 0){
                    callback(null);
                }
                // else: display error message
                console.log('Unavailable Activity');
            });
        },
        (callback) => {
            Activity.update({id: req.body.activity_id},
                {$set:{title: req.body.title}},
                (err) => {
                    if(err) return console.log('Error: '+err);
                    callback(null);
                }
            );
        }
    ],
    (err, result) => {
        if(err){
            console.log('Error: ' + err);
        }
        return res.redirect('/activity');
    });
}

module.exports = {
    display_index: display_index,
    display_activity: display_activity,
    create_activity: create_activity
}
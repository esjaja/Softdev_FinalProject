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
        return res.redirect('/activity?page='+activity_id);
    });
}

var display_activity = (req, res, next) => {
    if(typeof req.query.page === 'undefined' || req.query.page === null) return res.redirect('/index');
    async.waterfall([
        (callback) => {
            Activity.findOne({id: req.query.page}, (err, activity) => {
                if(err){
                    return console.log('Error: ' + err);
                }
                if(typeof activity === 'undefined' || activity === null){
                    return console.log('Unavailable Activity');
                }
                let dt = [];
                if(typeof activity.date !== 'undefined') dt = activity.date.map((dt) => {
                    return dt.toISOString().slice(0,10);
                });
                callback(null, activity, dt);
            });
        }
    ], (err, activity, date) => {
        return res.render('activity', {
            uid: req.session.user_id,
            token: req.session.token,
            user_id: activity.user_id,
            title: activity.title,
            date: date,
            description: activity.description,
            vote_id: activity.vote_id
        });
    });
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
                    if(act.date.length > 0) act_new.date = act.date[0].toISOString().slice(0,10);
                    else act_new.date = "";
                    return act_new;
                });

                let tmp = [];
                //{ date: "2016-12-05", activity_id: [1,2,3]}
                for(let act in activities) {
                    if(typeof act.date === 'undefined' || act.date === null) continue;
                    let dt = act.date.forEach((date, index, array) => {
                        let str = date.toISOString().slice(0,10);
                        if(tmp[str] === null) tmp[str] = [act.id];
                        else tmp[str].push(act.id);
                    });
                }
                let dates = tmp.map((act, index) => {
                    return {
                        date: index,
                        activities: act
                    };
                });
                callback(null, activities_new, dates);
            });
        }
    ], (err, activities, dates) => {
        return res.render('index', {
            user_id: req.session.user_id,
            activities: activities,
            dates: dates
        });
    });
}

var edit_activity_title = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check activity_id is available
            Activity.findOne({id: req.body.activity_id}, (err, activity) => {
                if(err){
                    return console.log('Error: ' + err);
                }
                if(typeof activity === 'undefined' || activity === null){
                    return console.log('Unavailable Activity');
                }
                callback(null);
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
        return res.json({
            status: 200
        });
    });
}

var edit_activity_description = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check activity_id is available
            Activity.findOne({id: req.body.activity_id}, (err, activity) => {
                if(err){
                    return console.log('Error: ' + err);
                }
                if(typeof activity === 'undefined' || activity === null){
                    return console.log('Unavailable Activity');
                }
                callback(null);
            });
        },
        (callback) => {
            Activity.update({id: req.body.activity_id},
                {$set:{description: req.body.description}},
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
        return res.json({
            status: 200
        });
    });
}

var edit_activity_dates = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check activity_id is available
            Activity.findOne({id: req.body.activity_id}, (err, activity) => {
                if(err){
                    console.log('Error: ' + err);
                }
                if(typeof activity === 'undefined' || activity === null){
                    console.log('Unavailable Activity');
                }
                for(let dt in req.body.dates) {
                    if(dt.match(/(\d{4})-(\d{2})-(\d{2})/) === null) return console.log('Invalid Input');
                }
                callback(null);
            });
        },
        (callback) => {
            Activity.update({id: req.body.activity_id},
                {$set:{date: req.body.dates}},
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
        return res.json({
            status: 200
        });
    });
}

var add_activity_member = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Activity.update({id: req.body.activity_id},{//here 20161209 1:39
                $addToSet: {
                    user_id: req.body.user_id
                }
            },(err) => {
                if(err) return console.log('Error: '+err);
                callback(null);
            });
        }
    ],
    (err, result) => {
        if(err){
            console.log('Error: ' + err);
        }
        return res.json({
            status: 200
        });
    });
}

module.exports = {
    display_index: display_index,
    display_activity: display_activity,
    create_activity: create_activity,
    edit_activity_title: edit_activity_title,
    edit_activity_description: edit_activity_description,
    edit_activity_dates: edit_activity_dates,
    add_activity_member: add_activity_member
}

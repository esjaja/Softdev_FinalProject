'use strict';
var User = require('../model/User.js');
var Activity = require('../model/Activity.js');
var Message = require('../model/Message.js');
var Vote = require('../model/Vote.js');
var async = require('async');
var crypto = require('crypto');

var create_activity = (req, res, next) => {
    async.waterfall([
        (callback) => {
            let md5 = crypto.createHash('md5');
            let id = md5.update(new Date().getTime().toString() + req.session.user_id).digest('base64').replace(/\+/g, '-').replace(/\//g, '_');
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
                callback(null, activity_id);
            });
        }
    ], (err, activity_id) => {
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
                if(activity.user_id.indexOf(req.session.user_id) === -1) return res.redirect('/index');


                activity.total = activity.user_id.length;
                let date = [];
                if(typeof activity.date !== 'undefined'){
                    let dt = activity.date.map((dt, i) => {
                        let str = dt;
                        let timestamp = new Date(str);
                        timestamp.setDate(timestamp.getDate() + activity.date.length - i);
                        return {
                            date: str,
                            timestamp: timestamp.getTime()
                        };
                    });

                    let start, end;
                    start = "";
                    end = "";
                    for(let i in dt){
                        if(start === "") start = dt[i];
                        else if(dt[i].timestamp === start.timestamp) end = dt[i];
                        else {
                            if(end === "") date.push(start.date);
                            else date.push(start.date+" ~ "+end.date);
                            start = dt[i];
                            end = "";
                        }
                    }
                    if(end === "") date.push(start.date);
                    else date.push(start.date+" ~ "+end.date);
                }
                callback(null, activity, date);
            });
        },
        (activity, date, callback) => {
            Vote.find({id: {$in: activity.vote_id}, type: 'OTHERS'}, null, {sort: {title: 1}}, (err, votes) => {
                if (err) return console.log('Error: ' + err);

                for(let i = 0; i < votes.length; i++){
                    let join = 0;
                    let member = [];
                    for(let j = 0; j < votes[i].option.length; j++){
                        if(votes[i].option[j].attend.indexOf(req.session.user_id) >= 0) votes[i].option[j].agree = true;
                        else votes[i].option[j].agree = false;

                        if(votes[i].option[j].attend.length > 0) {
                            let m = votes[i].option[j].attend.split('/');
                            m.forEach((mem) => {
                                if(member.indexOf(mem) < 0 && mem != '') member.push(mem);
                            });
                        }
                    }

                    votes[i]['count'] = member.length;
                }
                let dt = new Date();
                //seperate into voting and voted
                let voting = votes.filter((vote) => {
                    let deadline = new Date(vote.deadline);
                    return deadline.getTime() - dt.getTime() > 0;
                });
                for(let i = voting.length - 1; i >= 0; i--) {
                    for(let j = voting[i].option.length - 1; j >= 0; j--){
                        var k = voting[i].option[j].attend.indexOf(req.session.user_id);
                        if(k !== -1) {
                           voting[i].option[j].attend = voting[i].option[j].attend.replace(req.session.user_id+'/', '');
                        }
                        voting[i].option[j].attends = voting[i].option[j].attend.split('/').filter((user) => {
                            return user !== '';
                        });
                    }
                }
                let voted = votes.filter((vote) => {
                    let deadline = new Date(vote.deadline);
                    return deadline.getTime() - dt.getTime() <= 0;
                });
                for(let i = voted.length - 1; i >= 0; i--) {
                    for(let j = voted[i].option.length - 1; j >= 0; j--){
                        voted[i].option[j].attends = voted[i].option[j].attend.split('/').filter((user) => {
                            return user !== '';
                        });
                    }
                }
                //console.log(voted);
                callback(null, activity, date, voting, voted);
            });
        },
        (activity, date, voting, voted, callback) => {
            let ids = activity.user_id.toString();
            User.find({id: {$in: activity.user_id}}, 'id name',(err, users) => {
                if(err) return console.log('Error: ' + err);
                let new_user = {};
                users.forEach((user) => {
                    new_user[user.id] = user.name;
                });
                callback(null, activity, date, voting, voted, new_user);
            });
        },
        (activity, date, voting, voted, users, callback) => {
            //get messages
            Message.find({activity_id: activity.id}, null, {sort: {time: 1}}, (err, messages) => {
                if(err) return console.log('Error: ' + err);
                messages.sort((a, b) => {
                    let dt_a = new Date(a.time);
                    let dt_b = new Date(b.time);
                    return dt_a.getTime() - dt_b.getTime();
                });
                messages.forEach((mes) => {
                    mes.user_name = users[mes.user_id];
                });
                callback(null, activity, date, voting, voted, messages);
            });
        }
    ], (err, activity, date, voting, voted, messages) => {
        //console.log(activity.total);
        //console.log(voting);
        for(let i of date) {
            if(date[i] === '') date.splice(i, 1);
        }

        return res.render('activity', {
            uid: req.session.user_id,
            token: req.session.token,
            user_id: activity.user_id,
            title: activity.title,
            date: date,
            description: activity.description,
            total: activity.total,
            voting: voting,
            voted: voted,
            messages: messages,
            me_id: req.session.user_id
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
            Activity.find({id: {$in: activity_id}}, null, {sort: {title: 1}},(err, activities) => {
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
                let tmp = [];
                callback(null, activities_new);
            });
        }
    ], (err, activities) => {
        return res.render('index', {
            user_id: req.session.user_id,
            activities: activities
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

var add_activity_member = (req, res, next) => {
    async.waterfall([
        (callback) => {
            User.update({id: req.body.user_id},{
                $addToSet: {
                    activity_id: req.body.activity_id
                }
            }, (err) => {
                if(err) return console.log('Error: '+err);
                callback(null);
            });
        },
        (callback) => {
            Activity.update({id: req.body.activity_id},{
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
                let dates = req.body['dates[]'];
                console.log(dates);
                for(let dt in dates) {
                    if(dates[dt] === '') dates.splice(dt, 1);
                    else if(dates[dt].match(/(\d{4})-(\d{2})-(\d{2})/) === null) return console.log('Invalid Input');
                }
                callback(null, dates);
            });
        },
        (dates, callback) => {
            Activity.update({id: req.body.activity_id},
                {$set: {date: dates} },
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

var get_activities_month =  (req, res, next) => {
    async.waterfall([
        (callback) => {
            //get the user's activity list
            User.findOne({id: req.session.user_id}, (err, user) => {
                if(err || user === null){
                    console.log('Error: ' + err);
                }
                callback(null, user.activity_id);
            });
        },
        (activity_id, callback) => {
            //get activities details
            Activity.find({id: {$in: activity_id}}, (err, activities) => {
                if(err || activities === null){
                    console.log('Error: ' + err);
                }
                let activities_new = [];
                let check = [];
                //{ date: "2016-12-05", activity_id: [1,2,3]}
                for(let act of activities) {
                    if(typeof act.date === 'undefined' || act.date === null) continue;
                    act.date.forEach((date, index, array) => {
                        let str = date;
                        let m = parseInt(req.body.month) + 1;
                        if(parseInt(str.slice(5,7)) === m){
                            if(typeof activities_new[act.id] === 'undefined' || activities_new[act.id] === null){
                                check.push({
                                    id: act.id,
                                    title: act.title
                                });
                                activities_new[act.id] = [str];
                            }
                            else activities_new[act.id].push(str);
                        }
                    });
                }
                let result = [];
                for(let act of check){
                    result.push({
                        activity_id: act.id,
                        title: act.title,
                        date: activities_new[act.id]
                    });
                    //console.log(result);
                }
                callback(null, result);
            });
        }
    ], (err, result) => {
        return res.json({
            activities: result
        });
    });
}

var remove_activity_member = (req, res, next) => {
    async.waterfall([
        (callback) => {
            User.update({id: req.body.user_id},{
                $pull: {
                    activity_id: req.body.activity_id
                }
            }, (err) => {
                if(err) return console.log('Error: '+err);
                callback(null);
            });
        },
        (callback) => {
            Activity.update({id: req.body.activity_id},{
                $pull: {
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

/*var get_activity_date = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //get activities details
            Activity.findOne({id: req.body.activity_id}, (err, activity) => {
                if(err || activity === null){
                    console.log('Error: ' + err);
                }
                callback(null, activity.date);
            });
        }
    ], (err, result) => {
        return res.json({
            dates: result
        });
    });
}*/

module.exports = {
    display_index: display_index,
    display_activity: display_activity,
    create_activity: create_activity,
    edit_activity_title: edit_activity_title,
    edit_activity_description: edit_activity_description,
    edit_activity_dates: edit_activity_dates,
    add_activity_member: add_activity_member,
    get_activities_month: get_activities_month,
    remove_activity_member: remove_activity_member
}

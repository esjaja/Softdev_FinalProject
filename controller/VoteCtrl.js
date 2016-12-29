'use strict';
var async = require('async');
var crypto = require('crypto');
var Vote = require('../model/Vote.js');
var Activity = require('../model/Activity.js');

var create_vote = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check input
            if(req.body.type !== "OTHERS" && req.body.type !== "time") return console.log('Error: '+"Wrong Type");
            if(req.body.type === "time"){
                let reg = /(\d{4})-(\d{2})-(\d{2})/;
                for(let opt in req.body.options){
                    if(opt.match(reg) === null) return console.log('Error: '+err);
                }
            }
            callback(null);
        },
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
            //create
            let option = [];
            let tmp = [];
            for(let opt of req.body['options[]']){
                let name = opt.replace(/\r\n|\n/g,"").replace(/\s+/g, "");
                if(name != "" && tmp.indexOf(name) === -1) {
                    option.push({
                        name: opt,
                        attend: ""
                    });
                    tmp.push(name);
                }
            }
            console.log(option);
            let md5 = crypto.createHash('md5');
            let vote_id = md5.update(new Date().getTime().toString() + req.session.user_id + req.body.activity_id).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            var vote = new Vote({
                id: vote_id,
                activity_id: req.body.activity_id,
                type: req.body.type,
                title: req.body.title,
                deadline: req.body.deadline,
                option: option
            });
            vote.save((err, result) => {
                if(err){
                    console.log('Error: ' + err);
                }
                callback(null, vote_id);
            });
        },
        (vote_id, callback) => {
            Activity.update({id: req.body.activity_id},
                {$push:{vote_id: vote_id}},
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

var add_option = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check vote_id exists and no duplicate options (if duplicate, ignore it)
            let option = req.body.option;
            Vote.findOne({id: req.body.vote_id}, (err, vote) => {
                if(err){
                    console.log('Error: ' + err);
                }
                if(vote === null){
                    console.log('No Votes');
                }
                if(vote.type === "time"){
                    let reg = /(\d{4})-(\d{2})-(\d{2})/;
                    if(option.match(reg) === null) return console.log('Error: not correct time');
                }
                let idx = vote.option.indexOf(option);
                if(idx !== -1){
                    //ignore duplicate options
                    return res.json({status: 300});
                }
                callback(null, option);
            });
        },
        (option, callback) => {
            //update
            let opt = {
                name: option,
                attend: ""
            }
            Vote.update({id: req.body.vote_id}, {
                $push: {
                    option: opt
                }
            }, (err) => {
                if(err){
                    console.log('Error: ' + err);
                }
                callback(null, option);
            });
        },
        (option, callback) => {
            Vote.findOne({id: req.body.vote_id}, (err, vote) => {
                console.log(vote);
                let option_id = vote.option.filter((opt) => {
                    return opt.name === option;
                })[0]._id;
                callback(null, option_id, vote.id);
            })
        }
    ],(err, option_id, vote_id) => {
        if(err){
            console.log('Error: ' + err);
        }
        return res.json({
            status: 200,
            user_id: req.session.user_id,
            option_id: option_id,
            vote_id: vote_id
        });
    });
}
var remove_option = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check vote_id exists and the options exists
            let option = req.body.option_id;
            //console.log(req.body);
            Vote.findOne({id: req.body.vote_id}, (err, vote) => {
                if(err){
                    console.log('Error: ' + err);
                }
                if(vote === null){
                    console.log('No Votes');
                }
                let member = [];
                for(let j = 0; j < vote.option.length; j++){
                    if(vote.option[j].id === req.body.option_id) continue;
                    if(vote.option[j].attend.length > 0) {
                        let m = vote.option[j].attend.split('/');
                        m.forEach((mem) => {
                            if(member.indexOf(mem) < 0 && mem != '') member.push(mem);
                        });
                    }
                }

                let count = member.length;
                callback(null, count);
            });
        },
        (count, callback) => {
            //update
            Vote.update({id: req.body.vote_id}, {
                $pull: {
                    option: { _id: req.body.option_id}
                }
            }, (err) => {
                if(err){
                    console.log('Error: ' + err);
                }
                callback(null, count);
            });
        }
    ],(err, result) => {
        if(err){
            console.log('Error: ' + err);
        }
        return res.json({
            status: 200,
            count: result
        });
    });
}

var delete_vote = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Vote.remove({id: req.body.vote_id}, (err) => {
                if(err) console.log('Error: ' + err);
                callback(null);
            });
        },
        (callback) => {
            Activity.update({id: req.body.activity_id}, {
                $pull: {
                    vote_id: req.body.vote_id
                }
            }, (err) => {
                if(err){
                    console.log('Error: ' + err);
                }
                callback(null);
            });
        }
    ], (err, result) => {
        return res.json({
            status: 200
        });
    });
}

var update_vote = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Vote.findOne({id: req.body.vote_id}, (err, vote) => {
                if(err){
                    console.log('Error: ' + err);
                }
                if(vote === null){
                    console.log('No Votes');
                }
                console.log(req.body);
                let op = vote.option.filter((option) => {
                    return option.name === req.body.option_name;
                });
                if(op.length === 0){
                    console.log('No Options');
                    return res.json({status: 100});
                }
                //console.log(op);
                console.log(req.body.attend);
                let idx = op[0].attend.indexOf(req.session.user_id);
                if(idx !== -1 && req.body.attend === "true") return res.json({status: 100});
                if(idx === -1 && req.body.attend === "false") return res.json({status: 100});
                if(req.body.attend === "true") op[0].attend += req.session.user_id + '/';
                if(req.body.attend === "false") op[0].attend = op[0].attend.replace(req.session.user_id+'/', '');
                callback(null, op[0]);
            });
        },
        (option, callback) => {
            //console.log(option.attend);
            Vote.update({"id":req.body.vote_id, "option": { $elemMatch: { "name": req.body.option_name}}}, {
                $set: {
                    "option.$.attend": option.attend
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
        return res.json({status: 200});
    });
}

var set_vote_date = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check input
            if(req.body.type !== "time") return console.log('Error: '+"Wrong Type");
            else {
                let reg = /(\d{4})-(\d{2})-(\d{2})/;
                for(let opt in req.body.options){
                    if(opt.match(reg) === null) return console.log('Error: '+err);
                }
            }
            callback(null);
        },
        (callback) => {
            //check activity_id is available
            Activity.findOne({id: req.body.activity_id}, (err, activity) => {
                if(err){
                    return console.log('Error: ' + err);
                }
                if(typeof activity === 'undefined' || activity === null){
                    return console.log('Unavailable Activity');
                }
                let exist = false;
                if(activity.vote_id.indexOf('time_'+req.body.activity_id) !== -1) exist = true;
                callback(null, exist, activity.title);
            });
        },
        (exist, title, callback) => {
            if( !exist ){
                //create
                let option = [];
                let tmp = [];
                for(let opt of req.body['options[]']){
                    let name = opt.replace(/\r\n|\n/g,"").replace(/\s+/g, "");
                    if(name != "" && tmp.indexOf(name) === -1) {
                        option.push({
                            name: opt,
                            attend: ""
                        });
                        tmp.push(name);
                    }
                }
                let vote_id = 'time_'+req.body.activity_id;
                var vote = new Vote({
                    id: vote_id,
                    activity_id: req.body.activity_id,
                    type: req.body.type,
                    title: "asking available dates for "+title,
                    deadline: "",
                    option: option
                });
                vote.save((err, result) => {
                    if(err){
                        console.log('Error: ' + err);
                    }
                    callback(null, vote_id, exist, null);
                });
            }
            else {
                let options = req.body['options[]'];
                Vote.findOne({id: 'time_'+req.body.activity_id}, (err, vote) => {
                    if(err){
                        console.log('Error: ' + err);
                    }
                    if(vote === null){
                        console.log('No Votes');
                    }
                    if(vote.type === "time"){
                        let reg = /(\d{4})-(\d{2})-(\d{2})/;
                        for(let opt of options){
                            if(opt.match(reg) === null) return console.log('Error: '+err);
                        }
                    }
                    /*for(let option of vote.option){
                        let idx = options.indexOf(option.name);
                        if(idx !== -1){
                            //ignore duplicate options
                            options = options.slice(idx, 1);
                        }
                    }*/
                    callback(null, vote.id, exist, options);
                });
            }
        },
        (vote_id, exist, options, callback) => {
            if(!exist){
                Activity.update({id: req.body.activity_id},
                    {$push:{vote_id: vote_id}},
                    (err) => {
                        if(err) return console.log('Error: '+err);
                        callback(null);
                    }
                );
            }
            else {
                //update
                let op = options.map((option) => {
                    return {
                        name: option,
                        attend: ""
                    };
                });
                console.log(op);
                Vote.update({id: vote_id}, {
                    $set: {
                        option: op
                    }
                }, (err) => {
                    if(err){
                        console.log('Error: ' + err);
                    }
                    callback(null);
                });
            }
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

var get_vote_event_date = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Vote.findOne({id: 'time_'+req.body.activity_id}, (err, vote) => {
                if(err){
                    console.log('Error: ' + err);
                }
                let dates = [];
                if(vote === null) console.log('No Vote');
                else {
                    dates = vote.option.map((opt) => {
                        return opt.name;
                    });
                }
                callback(null, dates);
            });
        },
        (vote, callback) => {
            //get activities details
            Activity.findOne({id: req.body.activity_id}, (err, activity) => {
                if(err || activity === null){
                    console.log('Error: ' + err);
                }
                callback(null, activity.date, vote);
            });
        }
    ],(err, events, votes) => {
        if(err) console.log('Error: ' + err);
        return res.json({
            status: 200,
            vote_date: votes,
            event_date: events
        });
    });
}

var get_vote_one_day = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Vote.findOne({id: 'time_'+req.body.activity_id}, (err, vote) => {
                if(err){
                    console.log('Error: ' + err);
                    return res.json({
                        status: 100
                    });
                }
                let dates = [];
                if(vote === null) console.log('No Vote');
                else {
                    let date = vote.option.filter((opt) => {
                        return opt.name === req.body.date;
                    })
                    let agree = false;
                    if(date[0].attend.indexOf(req.session.user_id) !== -1) agree = true;
                    let atnd = date[0].attend.split('/');
                    let idx = atnd.indexOf('');
                    while (idx !== -1) {
                        console.log(idx);
                        atnd.splice(idx, 1);
                        idx = atnd.indexOf('');
                    }
                    callback(null, atnd, agree);
                }
            });
        }
    ],(err, result, agree) => {
        if(err) console.log('Error: ' + err);
        return res.json({
            status: 200,
            atnd: result,
            agree: agree
        });
    });
}




module.exports = {
    create_vote: create_vote,
    remove_option: remove_option,
    update_vote: update_vote,
    delete_vote: delete_vote,
    set_vote_date: set_vote_date,
    get_vote_event_date: get_vote_event_date,
    add_option: add_option,
    delete_vote: delete_vote,
    get_vote_one_day: get_vote_one_day
}

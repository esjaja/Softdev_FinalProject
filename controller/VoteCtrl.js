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
            for(let opt of req.body['options[]']){
                option.push({
                    name: opt,
                    attend: []
                });
            }
            let md5 = crypto.createHash('md5');
            let vote_id = md5.update(new Date().getTime().toString() + req.session.user_id + req.body.activity_id).digest('base64').replace(/\+/g, '-').replace(/\//g, '_');
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

var add_options = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check vote_id exists and no duplicate options (if duplicate, ignore it)
            let options = req.body.options;
            Vote.findOne({id: req.body.vote_id}, (err, vote) => {
                if(err){
                    console.log('Error: ' + err);
                }
                if(vote === null){
                    console.log('No Votes');
                }
                if(vote.type === "time"){
                    let reg = /(\d{4})-(\d{2})-(\d{2})/;
                    for(let opt of req.body.options){
                        if(opt.match(reg) === null) return console.log('Error: '+err);
                    }
                }
                for(let option of vote.option){
                    let idx = options.indexOf(option.name);
                    if(idx !== -1){
                        //ignore duplicate options
                        options.slice(idx, 1);
                    }
                }
                callback(null, options);
            });
        },
        (options, callback) => {
            //update
            let op = options.map((option) => {
                return {
                    name: option,
                    attend: []
                };
            });
            Vote.update({id:req.body.vote_id}, {
                $push: {
                    option: { $each: options }
                }
            }, (err) => {
                if(err){
                    console.log('Error: ' + err);
                }
                callback(null);
            });
        }
    ],(err, result) => {
        if(err){
            console.log('Error: ' + err);
        }
        return res.json({
            status: 200
        });
    });
}
var remove_options = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check vote_id exists and the options exists
            let options = req.body.options;
            Vote.findOne({id: req.body.vote_id}, (err, vote) => {
                if(err){
                    console.log('Error: ' + err);
                }
                if(vote === null){
                    console.log('No Votes');
                }
                for(let option of vote.option){
                    let idx = options.indexOf(option.name);
                    if(idx === -1){
                        //ignore un-exist options
                        options.slice(idx, 1);
                    }
                }
                callback(null, options);
            });
        },
        (options, callback) => {
            //update
            Vote.update({id:req.body.vote_id}, {
                $pull: {
                    option: { name: { $in: options } }
                }
            }, (err) => {
                if(err){
                    console.log('Error: ' + err);
                }
                callback(null);
            });
        }
    ],(err, result) => {
        if(err){
            console.log('Error: ' + err);
        }
        return res.json({
            status: 200
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
                let op = vote.option.filter((option) => {
                    return option.name === req.body.option_name;
                });
                if(op.length === 0){
                    console.log('No Options');
                }
                let idx = op[0].attend.indexOf(req.session.user_id);
                if(idx !== -1 && req.body.attend === true) return res.redirect('/activity?page='+req.body.activity_id);
                if(idx === -1 && req.body.attend === false) return res.redirect('/activity?page='+req.body.activity_id);
                callback(null, op);
            });
        },
        (option, callback) => {
            if(req.body.attend === true) Vote.update({"id":req.body.vote_id, "option.name": req.body.option_name}, {
                $push: {
                    "option.$.attend": req.session.user_id
                }
            }, (err) => {
                if(err){

                }
                callback(null);
            });
            else Vote.update({id:req.body.vote_id}, {
                $pull: {
                    "option.$.attend": req.session.user_id
                }
            }, (err) => {
                if(err){

                }
                callback(null);
            });
        }
    ], (err, result) => {
        if(err){
            console.log('Error: ' + err);
        }
        return res.redirect('activity');
    });
}
/*var get_vote = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Vote.findOne({id: req.body.vote_id}, (err, vote) => {
                if(err){
                    console.log('Error: ' + err);
                }
                if(vote === null) console.log('No Vote');
                callback(null, vote);
            });
        }
    ],(err, result) => {
        if(err) console.log('Error: ' + err);
        return res.render('activity', vote);
    });
}*/

module.exports = {
    create_vote: create_vote,
    add_options: add_options,
    remove_options: remove_options,
    update_vote: update_vote,
    delete_vote: delete_vote
}

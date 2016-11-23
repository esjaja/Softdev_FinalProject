var async = require('async');
var Vote = require('../model/Vote.js');
var Activity = require('../model/Activity.js');

var create_vote = (req, res, next) => {
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
            //create
            var vote = new Vote({
                id:
                activity_id: req.body.activity_id,
                type: req.body.type,
                deadline: req.body.deadline,
                option: req.body.options
            });
            vote.save((err, result) => {
                if(err){
                    console.log('Error: ' + err);
                }
                callback(null);
            });
        }
    ],
    (err, result) => {
        if(err){
            console.log('Error: ' + err);
        }
        return res.redirect('/activity');
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
        return res.redirect('activity');
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
        return res.redirect('activity');
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
                let idx = op[0].attend.indexOf(req.body.user_id);
                if(idx !== -1 && req.body.attend === true) return res.redirect('activity');
                if(idx === -1 && req.body.attend === false) return res.redirect('activity');
                callback(null, op);
            });
        },
        (option, callback) => {
            if(req.body.attend === true) Vote.update({id:req.body.vote_id}, {
                $push: {
                    option.$.attend: req.body.user_id
                }
            }, (err) => {
                if(err){

                }
                callback(null);
            });
            else Vote.update({id:req.body.vote_id}, {
                $pull: {
                    option.$.attend: req.body.user_id
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
var get_vote = (req, res, next) => {
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
}

module.exports = {
    create_vote: create_vote,
    add_options: add_options,
    remove_options: remove_options,
    update_vote: update_vote,
    get_vote: get_vote
}

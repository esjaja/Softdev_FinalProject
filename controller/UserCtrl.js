'use strict';
var User = require('../model/User.js');
var async = require('async');

var login = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check user exist and update token, if no, add it
            User.findOne({id: req.body.user_id}, (err, user) => {
                if(err) return console.log('Error: '+err);
                if(typeof user === 'undefined' || user === null){
                    let user_new = new User({
                        id: req.body.user_id,
                        fb_token: req.body.token,
                        activity_id: []
                    });
                    user_new.save((err, result) => {
                        if(err || result === null) return console.log('Error: '+err);
                        callback(null, req.body.user_id);
                    });
                }
                else if(req.body.token != user.fb_token) {
                    User.update({id: req.body.user_id},
                        {$set:{fb_token: req.body.token}},
                        (err) => {
                            if(err) return console.log('Error: '+err);
                            callback(null, req.body.user_id);
                        }
                    );
                }
                else callback(null, req.body.user_id);
            });
        }
    ], (err, result) => {
        if(err) return console.log('Error: '+err);
        req.session.user_id = req.body.user_id;
        req.session.token = req.body.token;
        return res.redirect('/index');
    });
}
var logout = (req, res, next) => {
    req.session.destroy();
    return res.redirect('/');
}

var display_login = (req, res, next) => {
    if(req.session.user_id != null){
        //Check login state. If the user has logged in, he or she does not need to click login button again
        return res.redirect('/index');
    }
    return res.render('login');
}

module.exports = {
    login: login,
    logout: logout,
    display_login: display_login
}

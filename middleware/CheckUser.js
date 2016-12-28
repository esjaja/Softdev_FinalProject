var User = require('../model/User.js');
var async = require('async');
var request = require('request');

var check_login = (req, res, next) => {

		request.post(
		    'https://graph.facebook.com/v2.8/oauth/access_token?client_id=562604030601218&client_secret=daa4f0cbb45265a743f53ab2a0711d29&grant_type=client_credentials',
		    function (error, response, body) {
		        if (!error && response.statusCode == 200) {
		        	User.update({id: req.session.user_id},
					      {$set:{fb_token: JSON.parse(response.body).access_token}},
					      (err) => {
					          if(err) return console.log('Error: '+err);
					          callback(null);
					      }
					    );
		        }else{
		        	console.log(error);
		        }
		    }
		);

    if(req.session.user_id === null) return res.redirect('/');
    if(typeof req.session.user_id !== 'string') return res.redirect('/logout');
    User.findOne({id: req.session.user_id}, (err, user) => {
        if(user === null) return res.redirect('/logout');
        else return next();
    });
}

module.exports = {
    check_login: check_login
}

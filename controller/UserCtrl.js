var User = require('../model/User.js');

var register = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //get user's id
        },
        (callback) => {
            //save it in DB
        }
    ], (err, result) => {

    });
    return res;
}
var login = (req, res, next) => {
    async.waterfall([
        (callback) => {
            //check user exist
            User.findOne({id: user_id}, (err, user) => {
                if(err) return console.log('Error: '+err);
                callback(null);
            });
        }
    ], (err, result) => {
        if(err) return console.log('Error: '+err);
        return res.redirect('/index');
    });
}
var logout = (req, res, next) => {
    req.session.destroy();
    return res.redirect('/login');
}

module.exports = {
    register: register,
    login: login,
    logout: logout
}

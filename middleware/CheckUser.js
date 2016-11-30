var User = require('../model/User.js');

var check_login = (req, res, next) => {
    if(req.session.user_id === null || typeof req.session.user_id !== 'string') return console.log('Error: no login');
    User.findOne({id: req.session.user_id}, (err, user) => {
        if(user === null) return console.log('Error: no user');
        else return next();
    });
}

module.exports = {
    check_login: check_login
}

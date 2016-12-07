var User = require('../model/User.js');

var check_login = (req, res, next) => {
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

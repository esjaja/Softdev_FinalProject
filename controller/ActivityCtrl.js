var User = require('../model/User.js');
var Activity = require('../model/Activity.js');
var Vote = require('../model/Vote.js');

var createActivity = (req, res, next) => {
    return res;
}

var display_activity = (req, res, next) => {
    return res.render('activity');
}
var display_index = (req, res, next) => {
    return res.render('index');
}


module.exports = {
    display_index: display_index,
    display_activity: display_activity
}

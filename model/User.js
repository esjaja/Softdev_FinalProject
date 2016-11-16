var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id: String,
    activity_id: [String]
});

module.exports = mongoose.model('User', User);

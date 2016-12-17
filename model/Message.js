var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message = new Schema({
    id: String,
    activity_id: String,
    user_id: String,
    time: String,
    content: String
});

module.exports = mongoose.model('Message', Message);

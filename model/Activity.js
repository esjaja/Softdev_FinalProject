var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Activity = new Schema({
    id: String,
    user_id: [String],
    title: String,
    date: [Date],
    description: String,
    vote_id: [String]    
});

module.exports = mongoose.model('Activity', Activity);

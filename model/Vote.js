var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Vote = new Schema({
    id: String,
    activity_id: String,
    deadline: String,
    type: String,
    title: String,
    option: [
        {
            name: String,
            attend: [String]
        }
    ]
});

module.exports = mongoose.model('Vote', Vote);

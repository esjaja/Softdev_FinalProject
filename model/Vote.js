var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Vote = new Schema({
    id: String,
    activity_id: String,
    deadline: Date,
    option: [
        {
            type: String,
            title: String,
            agree_user: [String]
        }
    ]
});

module.exports = mongoose.model('Vote', Vote);

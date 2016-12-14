var User = require('../model/User.js');
var Activity = require('../model/Activity.js');
var Message = require('../model/Message.js');

var add_message = (req, res, next) => {
    async.waterfall([
        (callback) => {
            let t = new Date();
            let md5 = crypto.createHash('md5');
            let id = md5.update(t.getTime().toString() + req.session.user_id + req.body.activity_id).digest('base64').replace(/\+/g, '-').replace(/\//g, '_');
            let message = {
                id: id,
                activity_id: req.body.activity_id,
                user_id: req.session.user_id,
                time: t.toISOString().slice(0,19).replace('T', ' '),
                content: req.body.message
            };
            Message.save(message, (err, result) => {
                if(err || result === null){
                    console.log('Error: ' + err);
                }
                callback(null);
            });
        }
    ], (err, result) => {
        return res.json({
            status: 200
        });
    });
}

var delete_message = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Message.remove({id: req.body.message_id}, (err) => {
                if(err) console.log('Error: ' + err);
                callback(null);
            });
        }
    ], (err, result) => {
        return res.json({
            status: 200
        });
    });
}

module.expors = {
    add_message: add_message,
    delete_message: delete_message
};

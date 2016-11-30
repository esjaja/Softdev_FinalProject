var validation = require('validation.js');

var check_input = (req, res, next) => {
    req.checkBody(validation.validator);
    let errors = req.validationErrors();
    if(error.length > 0){

    }
    next();
}

module.exports = {
    check_input: check_input
}

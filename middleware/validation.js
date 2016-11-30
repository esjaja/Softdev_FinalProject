var validator = require('validator');
var custom_validators = {
    isArray: (value) => {
        return Array.isArray(value);
    },
    checkDate: (value) => {
        return value.every((val) => {
            return validator.isDate(val);
        });
    },
    checkType: (value) => {
        return (value === 'DATE' || value === 'OPTION');
    }
}

var options = {
    'user_id': {
        notEmpty: true,
        errorMessage: 'Invalid User'
    },
    'title': {
        notEmpty: true,
        errorMessage: 'Invalid Title'
    },
    'activity_id': {
        notEmpty: true,
        errorMessage: 'Invalid Activity'
    },
    'vote_id': {
        notEmpty: true,
        errorMessage: 'Invalid Vote'
    }
    'message': {
        notEmpty: true,
        errorMessage: 'Invalid Message'
    },
    'type': {
        notEmpty: true,
        checkType: {
            errorMessage: 'Invalid Type of Vote'
        }
    }
    'attend': {
        notEmpty: true,
        errorMessage: 'Invalid Attending Options'
    }
    'option_name': {
        notEmpty: true,
        errorMessage: 'Invalid Option'
    },
    'deadline': {
        notEmpty: true,
        isDate: true,
        errorMessage: 'Invalid Deadline'
    }
    'date': {
        notEmpty: true,
        isArray: {
            errorMessage: 'Need Date Lists'
        },
        checkDate: {
            errorMessage: 'Invalid Dates'
        },
        errorMessage: 'No Dates'
    },
    'member': {
        notEmpty: true,
        isArray: {
            errorMessage: 'Need Member Lists'
        },
        errorMessage: 'No Members'
    },
    'options': {
        notEmpty: true,
        isArray: {
            errorMessage: 'Need Option Lists'
        },
        errorMessage: 'No Options'
    }
}

var validator = {
    '/'
}

module.exports = {
    custom_validators: custom_validators,
}

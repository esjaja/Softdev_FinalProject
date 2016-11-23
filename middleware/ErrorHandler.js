module.exports = {
    get_error: (code) => {
        var message = {
            '-1': 'server error'
        }
        var error = {
			status: parseInt(code),
			message: message[code]
		};
        return error;
    }
}

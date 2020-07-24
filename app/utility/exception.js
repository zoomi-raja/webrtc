function actionException(message, action) {
	const error = new Error(message);
	error.action = action;
	return error;
}

actionException.prototype = Object.create(Error.prototype);

module.exports = actionException;

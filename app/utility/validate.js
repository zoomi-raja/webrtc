const { v4: uuidv4 } = require("uuid");
const exception = require("../utility/exception");
exports.validateLoginRequest = (request) => {
	if (
		!request.hasOwnProperty("type") ||
		!["broadcaster", "audience"].includes(request.type)
	) {
		throw new exception("type is invalid", "login");
	} else {
		const type = request.type;
		let user = {};
		if (type == "broadcaster") {
			user = (({
				name,
				userID = uuidv4(),
				avatar,
				title,
				category = "other",
				tags = "",
				type,
			}) => ({ name, userID, avatar, title, category, tags, type }))(request);
		} else {
			user = (({ name, userID = uuidv4(), avatar, broadcaster, type }) => ({
				name,
				userID,
				avatar,
				broadcaster,
				type,
			}))(request);
		}
		return user;
	}
};

exports.validateBroadcaster = (userMap, name) => {
	if (userMap.has(name)) {
		//check if broadcast was intrepted
		room = userMap.get(name);
		if (room.user.intrepted) {
			return true;
		} else {
			throw new exception("Username is unavailable", "already_open");
		}
	}
};
exports.validateAudience = (userMap, request) => {
	if (!userMap.has(request.broadcaster)) {
		throw new exception("login", "no such broadcaster");
	} else {
		let broadcaster = userMap.get(request.broadcaster);
		if (
			broadcaster.user.audience &&
			broadcaster.user.audience.has(request.name)
		) {
			throw new exception("already_open", "Username is unavailable");
		}
	}
};

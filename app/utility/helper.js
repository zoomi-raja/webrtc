const sendTo = (connection, message) => {
	if (connection && connection.readyState === 1) {
		connection.send(JSON.stringify(message));
	}
};
const sendToAll = (allConnections, type, currentConnection) => {
	let { userID, name } = currentConnection.user;
	for (let audience of allConnections.values()) {
		if (audience.readyState === 1) {
			audience.send(
				JSON.stringify({
					type,
					user: { userID, name },
				})
			);
		}
	}
};

const intervalForIntreptedBroadCaster = (connection, userMap) => {
	return setTimeout(() => {
		let room = userMap.get(connection.user.name);
		userMap.delete(connection.user.name);
		sendToAll(room.user.audience, "broadcast-finished", connection);
	}, 30000);
};

module.exports = { sendTo, sendToAll, intervalForIntreptedBroadCaster };

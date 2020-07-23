exports.sendTo = (connection, message) => {
	if (connection && connection.readyState === 1) {
		connection.send(JSON.stringify(message));
	}
};
exports.sendToAll = (allConnections, type, currentConnection) => {
	let { id, name: userName } = currentConnection;
	allConnections.forEach(function each(connection) {
		if (connection !== currentConnection && connection.readyState === 1) {
			connection.send(
				JSON.stringify({
					type,
					user: { id, userName },
				})
			);
		}
	});
};

const {
	sendTo,
	sendToAll,
	intervalForIntreptedBroadCaster,
} = require("../utility/helper");
const {
	validateLoginRequest,
	validateBroadcaster,
	validateAudience,
} = require("../utility/validate");

module.exports = (userMap, request, allConnections, currentConnection) => {
	return {
		login: () => {
			try {
				let validated = validateLoginRequest(request);
				let loggedIn = [];
				let broadcaster;
				if (validated.type == "broadcaster") {
					let isIntrepted = validateBroadcaster(userMap, validated.name);
					if (isIntrepted) {
						broadcaster = userMap.get(validated.name);
						currentConnection.user = broadcaster.user;
						clearTimeout(currentConnection.user.interval);
						delete currentConnection.user.interval;
						currentConnection.user.intrepted = false;
						for (let { user } of broadcaster.user.audience.values()) {
							loggedIn.push({ ...user });
						}
						//notify all room member of reconnection
						sendToAll(
							broadcaster.user.audience,
							"broadcast-continue",
							currentConnection
						);
					} else {
						validated.audience = new Map();
						currentConnection.user = validated;
						userMap.set(validated.name, currentConnection);
					}
				} else {
					validateAudience(userMap, validated);
					broadcaster = userMap.get(validated.broadcaster);
					currentConnection.user = validated;
					for (let { user } of broadcaster.user.audience.values()) {
						loggedIn.push({ ...user });
					}
					broadcaster.user.audience.set(validated.name, currentConnection);
				}
				sendTo(currentConnection, {
					type: "login",
					success: true,
					users: loggedIn,
				});
				if (validated.type != "broadcaster") {
					sendTo(broadcaster, {
						type: "NewViewer",
						user: validated,
						count: broadcaster.user.audience.size,
					});
				}
			} catch (err) {
				console.log(err);
				sendTo(currentConnection, {
					type: err.action,
					success: false,
					message: err.message,
				});
			}
		},
		offer: () => {
			//offer only broadcaster will send
			let { offer = "join me", name } = request;
			let room = userMap.get(currentConnection.user.name);
			const offerRecipient = room ? room.user.audience.get(name) : false;
			if (!!offerRecipient) {
				sendTo(offerRecipient, {
					type: "offer",
					offer,
					name: currentConnection.user.name,
				});
				sendTo(currentConnection, {
					type: "offerSent",
					offer,
					name: offerRecipient.user.name,
				});
			} else {
				sendTo(currentConnection, {
					type: "error",
					message: `offer User ${name} does not exist!`,
				});
			}
		},
		answer: () => {
			const { name, answer = "ok" } = request;
			const answerRecipient = userMap.get(name);
			if (!!answerRecipient) {
				sendTo(answerRecipient, {
					type: "answer",
					answer,
					name: currentConnection.user.name,
				});
				sendTo(currentConnection, {
					type: "answerSent",
					answer,
					name: answerRecipient.user.name,
				});
			} else {
				sendTo(currentConnection, {
					type: "error",
					message: `broadcaster ${name} does not exist!`,
				});
			}
		},
		candidate: () => {
			//only broadcaster will share ice
			const { name, candidate = "" } = request;
			let room = userMap.get(currentConnection.user.name);
			const candidateRecipient = room ? room.user.audience.get(name) : false;
			if (!!candidateRecipient) {
				sendTo(candidateRecipient, {
					type: "candidate",
					candidate,
					name: currentConnection.user.name,
				});
			} else {
				sendTo(currentConnection, {
					type: "error",
					message: `candidate User ${name} does not exist!`,
				});
			}
		},
		broadcastEnd: () => {
			if (currentConnection.user) {
				let room = userMap.get(currentConnection.user.name);
				userMap.delete(currentConnection.user.name);
				sendToAll(room.user.audience, "broadcast-finished", currentConnection);
			} else {
				sendTo(currentConnection, {
					type: "broadcast",
					success: false,
					message: "no broadcast to finish",
				});
			}
		},
		connectionClosed: () => {
			let user = currentConnection.user;
			if (user.type && ["broadcaster", "audience"].includes(user.type)) {
				switch (user.type) {
					case "audience":
						if (user.broadcaster && userMap.has(user.broadcaster)) {
							let room = userMap.get(user.broadcaster);
							if (room.user.audience.has(user.name)) {
								room.user.audience.delete(user.name);
								sendTo(room, {
									type: "user-left",
									count: room.user.audience.size,
									name: user.name,
								});
								break;
							}
						}
						break;
					case "broadcaster":
						if (userMap.has(user.name)) {
							//this means connection intreption
							user.intrepted = true;
							user.intreptionTime = new Date().getTime();
							//this interval will trigger if broadcaster didnt return in specific time
							user.interval = intervalForIntreptedBroadCaster(
								currentConnection,
								userMap
							);
							let room = userMap.get(user.name);
							sendToAll(
								room.user.audience,
								"broadcast-intrepted",
								currentConnection
							);
						}
						break;
				}
			}
		},
	};
};

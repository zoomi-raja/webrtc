const { sendTo, sendToAll } = require("../utility/helper");
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
					validateBroadcaster(userMap, validated.name);
					validated.audience = new Map();
					currentConnection.user = validated;
					userMap.set(validated.name, currentConnection);
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
					});
				}
			} catch (err) {
				sendTo(currentConnection, {
					type: err.action,
					success: false,
					message: err.message,
				});
			}
		},
		offer: () => {
			let { offer = "join me", name } = request;
			const offerRecipient = userMap.get(name);
			if (!!offerRecipient) {
				sendTo(offerRecipient, {
					type: "offer",
					offer,
					name: currentConnection.name,
				});
				sendTo(currentConnection, {
					type: "offerSent",
					offer,
					name: offerRecipient.name,
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
					name: currentConnection.name,
					answer,
				});
				sendTo(currentConnection, {
					type: "answerSent",
					answer,
				});
			} else {
				sendTo(currentConnection, {
					type: "error",
					message: `answer User ${name} does not exist!`,
				});
			}
		},
		candidate: () => {
			const { name, candidate = "" } = request;
			const candidateRecipient = userMap.get(name);
			if (!!candidateRecipient) {
				sendTo(candidateRecipient, {
					type: "candidate",
					candidate,
				});
			} else {
				sendTo(currentConnection, {
					type: "error",
					message: `candidate User ${name} does not exist!`,
				});
			}
		},
	};
};

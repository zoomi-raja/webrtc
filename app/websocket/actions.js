const { v4: uuidv4 } = require("uuid");
const { sendTo, sendToAll } = require("../utility/helper");
module.exports = (userMap, request, allConnections, currentConnection) => {
	return {
		login: () => {
			let { name } = request;
			if (userMap.has(name)) {
				sendTo(currentConnection, {
					type: "login",
					success: false,
					message: "Username is unavailable",
				});
			} else {
				const id = uuidv4();
				let loggedIn = [];
				for (let { id, name: userName } of userMap.values()) {
					loggedIn.push({ id, userName });
				}
				userMap.set(name, currentConnection);
				currentConnection.name = name;
				currentConnection.id = id;
				sendTo(currentConnection, {
					type: "login",
					success: true,
					users: loggedIn,
				});
				if (name != "broadcaster") {
					sendTo(userMap.get("broadcaster"), {
						type: "updateUser",
						user: { id, name },
					});
				}
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

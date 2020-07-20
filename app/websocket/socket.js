const { v4: uuidv4 } = require("uuid");
const { sendTo, sendToAll } = require("../utility/helper");
const userMap = new Map();
const socket = (wss, WebSocket) => {
	wss.on("connection", (ws, request) => {
		// console.log(WebSocket.OPEN);
		ws.on("message", (msg) => {
			let data;
			try {
				data = JSON.parse(msg);
			} catch (e) {
				data = {};
			}
			const { type, name, offer, answer, candidate } = data;
			//Handle message by type
			switch (type) {
				//when a user tries to login
				case "login":
					//Check if username is available
					if (userMap.has(name)) {
						sendTo(ws, {
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
						userMap.set(name, ws);
						ws.name = name;
						ws.id = id;
						sendTo(ws, {
							type: "login",
							success: true,
							users: loggedIn,
						});
						sendToAll(wss.clients, "updateUsers", ws);
					}
					break;
				case "offer":
					//Check if user to send offer to exists
					const offerRecipient = userMap.get(name);
					if (!!offerRecipient) {
						sendTo(offerRecipient, {
							type: "offer",
							offer,
							name: ws.name,
						});
						sendTo(ws, {
							type: "offerSent",
							offer,
							name: offerRecipient.name,
						});
					} else {
						sendTo(ws, {
							type: "error",
							message: `User ${name} does not exist!`,
						});
					}
					break;
				case "answer":
					//Check if user to send answer to exists
					const answerRecipient = userMap.get(name);
					if (!!answerRecipient) {
						sendTo(answerRecipient, {
							type: "answer",
							answer,
						});
						sendTo(ws, {
							type: "answerSent",
							answer,
						});
					} else {
						sendTo(ws, {
							type: "error",
							message: `User ${name} does not exist!`,
						});
					}
					break;
				case "candidate":
					//Check if user to send candidate to exists
					const candidateRecipient = userMap.get(name);
					if (!!candidateRecipient) {
						sendTo(candidateRecipient, {
							type: "candidate",
							candidate,
						});
					} else {
						sendTo(ws, {
							type: "error",
							message: `User ${name} does not exist!`,
						});
					}
					break;
				case "leave":
					sendToAll(wss.clients, "leave", ws);
					break;

				default:
					sendTo(ws, {
						type: "error",
						message: "Command not found: " + type,
					});
					break;
			}
		});
		ws.on("close", function () {
			delete userMap.delete(ws.name);
			sendToAll(wss.clients, "leave", ws);
		});
		//send immediate a feedback to the incoming connection
		ws.send(
			JSON.stringify({
				type: "connect",
				message: "Well hello there, I am a WebSocket server",
			})
		);
	});
};

module.exports = socket;

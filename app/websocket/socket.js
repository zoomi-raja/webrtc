const { v4: uuidv4 } = require("uuid");
const { sendTo, sendToAll } = require("../utility/helper");
const actions = require("./actions");
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
			const { type } = data;
			console.log(data);
			let event = actions(userMap, data, wss.clients, ws);
			//Handle message by type
			switch (type) {
				case "login":
					//Check if username is available
					event.login();
					break;
				case "offer":
					//Check if user to send offer to exists
					event.offer();
					break;
				case "answer":
					//Check if user to send answer to exists
					event.answer();
					break;
				case "candidate":
					//Check if user to send candidate to exists
					event.candidate();
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

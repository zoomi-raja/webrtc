const WebSocket = require("ws");
const { sendTo } = require("../utility/helper");
const actions = require("./actions");

const socket = (server, userMap) => {
	const wss = new WebSocket.Server({ server });
	wss.on("connection", (ws, request) => {
		console.log("new connetion");
		// console.log(WebSocket.OPEN);
		ws.on("message", (msg) => {
			let data;
			try {
				data = JSON.parse(msg);
			} catch (e) {
				data = {};
			}
			const { action } = data;
			let event = actions(userMap, data, wss.clients, ws);
			//Handle message by type
			switch (action) {
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
				case "stop-broadcasting":
					event.broadcastEnd();
					break;
				case "requst-reconnect":
					event.reconnect();
					break;
				default:
					sendTo(ws, {
						type: "error",
						message: "Command not found: " + action,
					});
					break;
			}
		});
		ws.on("close", function () {
			let event = actions(userMap, {}, wss.clients, ws);
			event.connectionClosed();
		});
		//send immediate a feedback to the incoming connection
		ws.send(
			JSON.stringify({
				type: "connect",
				message: "Well hello there, I am a WebSocket server",
			})
		);
	});

	server.on("upgrade", function upgrade(request, socket, head) {
		if (/test/.test(request.url)) {
			//will add authentication here and api to get categories
			socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
			socket.destroy();
			console.log("destroy");
			return;
		}
	});
};

module.exports = socket;

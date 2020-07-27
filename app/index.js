const express = require("express");
const http = require("http");
const cors = require("cors");
const socketConnect = require("./websocket/socket");
const broadcastRoutes = require("./routes/broadcastRoutes");

const app = express();
//set allowed origins
const allowedOrigins = ["http://localhost:3000"];
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				const msg =
					"The CORS policy for this site does not " +
					"allow access from the specified Origin.";
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
	})
);
/*
credentials={
	key: fs.readFileSync(path.join(__dirname + "/privkey.pem")),
	cert: fs.readFileSync(path.join(__dirname + "/cert.pem")),
}
https.createServer(credentials, app);
*/
const server = http.createServer(app);
//to maintain broadcaster and their audience
const userMap = new Map();

//routes
app.use("/api/v1/broadcasts", broadcastRoutes(userMap));
//initialize the WebSocket server instance
socketConnect(server, userMap);
module.exports = server;

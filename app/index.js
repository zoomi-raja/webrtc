const express = require("express");
const http = require("http");
const socketConnect = require("./websocket/socket");

const app = express();
const server = http.createServer(app);
//to maintain broadcaster and their audience
const userMap = new Map();

//initialize the WebSocket server instance
socketConnect(server, userMap);
module.exports = server;

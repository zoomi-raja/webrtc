const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const socketConnect = require("./websocket/socket");

const app = express();
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
socketConnect(wss, WebSocket);
module.exports = server;

import React, { useRef, useEffect, useState } from "react";

import classes from "./Audience.module.scss";
import SweetAlert from "react-bootstrap-sweetalert";
// Use for remote connections
const configuration = {
	iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};
const Audience = (props) => {
	//refrences
	const webSocket = useRef(null);
	//states
	const [socketMessages, setSocketMessages] = useState([]);
	const [socketOpen, setSocketOpen] = useState(false);
	const [connection, setconnection] = useState(null);
	const [channel, setChannel] = useState(null);
	const [connectedTo, setConnectedTo] = useState("");
	const [name, setName] = useState("");
	const [message, setMessage] = useState("");

	const [alert, setAlert] = useState(null);
	//temp
	const connectedRef = useRef();
	const closeAlert = () => {
		setAlert(null);
	};

	const send = (data) => {
		webSocket.current.send(JSON.stringify(data));
	};
	useEffect(() => {
		webSocket.current = new WebSocket("ws://localhost:9000"); //process.env.REACT_APP_WEBSOCKET_URL
		webSocket.current.onmessage = (message) => {
			const data = JSON.parse(message.data);
			setSocketMessages((prev) => [...prev, data]);
		};
		webSocket.current.onclose = () => {
			webSocket.current.close();
		};
		const peerConnection = new RTCPeerConnection(configuration);
		peerConnection.onconnectionstatechange = (evt) => {
			console.log("change connection state: ", evt);
		};
		peerConnection.ondatachannel = (event) => {
			console.log("Data channel is created!");
			let receiveChannel = event.channel;
			receiveChannel.onopen = () => {
				console.log("Data channel is open and ready to be used.");
			};
			receiveChannel.onmessage = (msg) => {
				console.log(msg);
			};
			setChannel(receiveChannel);
		};
		setconnection(peerConnection);
		return () => webSocket.current.close();
	}, []);
	const handleLogin = () => {
		let user = new URLSearchParams(props.location.search).get("user");
		user = !user ? "user1" : user;
		setName(user);
		send({
			type: "login",
			name: user,
		});
	};
	useEffect(() => {
		let data = socketMessages.pop();
		if (data) {
			console.log(data);
			switch (data.type) {
				case "connect":
					setSocketOpen(true);
					break;
				case "login":
					console.log("login");
					break;
				case "offer":
					onOffer(data);
					break;
				case "candidate":
					onCandidate(data);
					break;
				default:
					break;
			}
		}
	}, [socketMessages]);

	//when we got ice candidate from another user
	const onCandidate = async ({ candidate }) => {
		try {
			await connection.addIceCandidate(candidate);
		} catch (e) {
			console.error("Error adding received ice candidate", e);
		}
	};
	const onOffer = async ({ offer, name }) => {
		setConnectedTo(name);
		connectedRef.current = name;
		connection.setRemoteDescription(new RTCSessionDescription(offer));
		const answer = await connection.createAnswer();
		await connection.setLocalDescription(answer);
		send({ type: "answer", answer, name }); //connection.localDescription
	};

	//send msg on channel but make sure channel is open
	const sendMsg = () => {
		const time = new Date().toLocaleString("en-us", {
			month: "short",
			year: "numeric",
			day: "2-digit",
		});
		let text = { time, message, name };
		console.log(channel.readyState);
		if (channel.readyState === "open") {
			channel.send(JSON.stringify(text));
		}
	};
	return (
		<div className={classes.container}>
			<div className={classes.container_video}>
				<button onClick={handleLogin}>Connect</button>
				{/* <video autoPlay playsInline ref={videoElement}></video> */}
			</div>
			<div className={classes.container_messages}>
				<div className={classes.msg_container}>
					<div className={classes.msg}>
						<span>no msg</span>
					</div>
				</div>
				<div className={classes.send_msg}>
					<input
						className={classes.send_msg_input}
						onChange={(e) => setMessage(e.target.value)}
					></input>
					<button className={classes.send_msg_btn} onClick={sendMsg}>
						Send
					</button>
				</div>
			</div>
		</div>
	);
};
export default Audience;

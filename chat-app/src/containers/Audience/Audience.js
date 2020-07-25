import React, { useRef, useEffect, useState } from "react";
import Messages from "../../components/Messages/Messages";
import SweetAlert from "react-bootstrap-sweetalert";
import { formatTime } from "../../utility/utility";

import classes from "./Audience.module.scss";
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
	const [messages, setMessages] = useState([]);

	const [alert, setAlert] = useState(null);
	const videoElement = useRef(null);
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
			receiveChannel.onmessage = (message) => {
				let data = JSON.parse(message.data);
				setMessages((prev) => [...prev, data]);
			};
			setChannel(receiveChannel);
		};
		//get stream from connection
		peerConnection.ontrack = async (event) => {
			const remoteStream = new MediaStream();
			videoElement.current.srcObject = remoteStream;
			remoteStream.addTrack(event.track, remoteStream);
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
		let time = formatTime(new Date());
		let text = { time, message, name };
		if (channel.readyState === "open") {
			channel.send(JSON.stringify(text));
		}
	};
	return (
		<div className={classes.container}>
			<div className={classes.container_video}>
				<button onClick={handleLogin}>Connect</button>
				<video autoPlay playsInline ref={videoElement}></video>
			</div>
			<Messages messages={messages} setMessage={setMessage} sendMsg={sendMsg} />
		</div>
	);
};
export default Audience;

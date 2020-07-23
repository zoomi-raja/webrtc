import React, { useRef, useEffect, useState } from "react";
import Messages from "../Messages/Messages";
import SweetAlert from "react-bootstrap-sweetalert";
import classes from "./Broadcaster.module.scss";

const configuration = {
	iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

const Breadcaster = () => {
	//refrences
	const videoElement = useRef(null);
	const webSocket = useRef(null);
	//states
	const [socketMessages, setSocketMessages] = useState([]);
	const [socketOpen, setSocketOpen] = useState(false);
	const [users, setUsers] = useState({});
	const [alert, setAlert] = useState(null);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);

	const mediaStreamConstraints = {
		video: true,
		audio: true,
	};
	const gotLocalMediaStream = (mediaStream) => {
		videoElement.current.srcObject = mediaStream;
	};
	const handleLocalMediaStreamError = (error) => {
		console.log("navigator.getUserMedia error: ", error);
	};
	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia(mediaStreamConstraints)
			.then(gotLocalMediaStream)
			.catch(handleLocalMediaStreamError);
		return () => (webSocket.current ? webSocket.current.close() : "");
	}, []);

	useEffect(() => {
		let data = socketMessages.pop();
		console.log(data);
		if (data) {
			switch (data.type) {
				case "connect":
					send({
						type: "login",
						name: "broadcaster",
					});
					setSocketOpen(true);
					break;
				case "login":
					onLogin(data);
					break;
				case "updateUser":
					onGuestJoined(data);
					break;
				case "leave":
					removeUser(data);
					break;
				case "answer":
					onAnswer(data);
					break;
				default:
					break;
			}
		}
	}, [socketMessages]);
	const onLogin = (data) => {
		console.log("on login code");
	};
	const onAnswer = ({ answer, name }) => {
		users[name].peerConnection.setRemoteDescription(
			new RTCSessionDescription(answer)
		);
	};
	const onGuestJoined = async ({ user }) => {
		user.peerConnection = new RTCPeerConnection(configuration);
		user.peerConnection.onconnectionstatechange = (evt) => {
			console.log("change connection state: ", evt);
		};
		//when remote answere to our offer and we set that in setRemoteDescription
		user.peerConnection.onicecandidate = ({ candidate }) => {
			console.log("ice candidate");
			let connectedTo = user.name;
			if (candidate && !!connectedTo) {
				send({
					name: connectedTo,
					type: "candidate",
					candidate,
				});
			}
		};
		//add stream to connection
		user.peerConnection.addStream(videoElement.current.srcObject);
		user.dataChannel = user.peerConnection.createDataChannel("messenger");
		user.dataChannel.onmessage = (message) => {
			let data = JSON.parse(message.data);
			setMessages((prev) => [...prev, data]);
		};
		const offer = await user.peerConnection.createOffer();
		await user.peerConnection.setLocalDescription(offer);
		send({
			type: "offer",
			offer,
			name: user.name,
		});
		setUsers((prev) => {
			return { ...prev, [user.name]: user };
		});
	};

	const removeUser = ({ user }) => {
		setUsers((prev) => {
			let users = { ...prev };
			delete users[user.name];
			return users;
		});
	};
	const send = (data) => {
		webSocket.current.send(JSON.stringify(data));
	};
	const sendMsg = () => {
		const time = new Date().toLocaleString("en-us", {
			month: "short",
			year: "numeric",
			day: "2-digit",
		});
		Object.values(users).forEach((user) => {
			let text = { time, message, name: user.name };
			if (user.dataChannel.readyState === "open") {
				user.dataChannel.send(JSON.stringify(text));
			}
		});
	};
	const golive = () => {
		webSocket.current = new WebSocket("ws://localhost:9000");
		webSocket.current.onmessage = (message) => {
			const data = JSON.parse(message.data);
			setSocketMessages((prev) => [...prev, data]);
		};
		webSocket.current.onclose = () => {
			webSocket.current.close();
		};
	};

	return (
		<div className={classes.container}>
			<div className={classes.container_video}>
				<video autoPlay playsInline ref={videoElement}></video>
				<button onClick={golive}>Go Live</button>
			</div>
			<Messages messages={messages} setMessage={setMessage} sendMsg={sendMsg} />
		</div>
	);
};
export default Breadcaster;

import React, { useRef, useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import classes from "./Broadcaster.module.scss";

const configuration = {
	iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

const Breadcaster = () => {
	//refrences
	const videoElement = useRef(null);
	const webSocket = useRef(null);
	const connectedRef = useRef();
	//states
	const [socketMessages, setSocketMessages] = useState([]);
	const [socketOpen, setSocketOpen] = useState(false);
	const [channel, setChannel] = useState(null);
	const [users, setUsers] = useState({});
	const [alert, setAlert] = useState(null);

	const mediaStreamConstraints = {
		video: true,
	};
	const gotLocalMediaStream = (mediaStream) => {
		// localVideo.srcObject = mediaStream;
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
		let dataChannel = user.peerConnection.createDataChannel("messenger");
		dataChannel.onmessage = (msg) => {
			console.log(msg);
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
			<div className={classes.container_messages}>
				<div className={classes.msg_container}>
					<div className={classes.msg}>
						<span>no msg</span>
					</div>
				</div>
				<div className={classes.send_msg}>
					<input className={classes.send_msg_input}></input>
					<button className={classes.send_msg_btn}>Send</button>
				</div>
			</div>
		</div>
	);
};
export default Breadcaster;

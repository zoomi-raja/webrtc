import React, { useRef, useEffect, useState } from "react";
import Messages from "../Messages/Messages";
import SweetAlert from "react-bootstrap-sweetalert";
import { formatTime, sendMsgOnPeerChannel } from "../../utility/utility";
import { config, IceConfiguration } from "../../utility/config";
import classes from "./Broadcaster.module.scss";

const Breadcaster = () => {
	//refrences
	const videoElement = useRef(null);
	const webSocket = useRef(null);
	const userRef = useRef({});
	//states
	const [socketMessages, setSocketMessages] = useState([]);
	const [users, setUsers] = useState({});
	const [alert, setAlert] = useState(null);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);

	const gotLocalMediaStream = (mediaStream) => {
		videoElement.current.srcObject = mediaStream;
	};
	const handleLocalMediaStreamError = (error) => {
		console.log("navigator.getUserMedia error: ", error);
	};
	useEffect(() => {
		userRef.current = { ...users };
	}, [users]);
	useEffect(() => {
		const mediaStreamConstraints = {
			video: true,
			audio: true,
		};
		navigator.mediaDevices
			.getUserMedia(mediaStreamConstraints)
			.then(gotLocalMediaStream)
			.catch(handleLocalMediaStreamError);
		return () => (webSocket.current ? webSocket.current.close() : "");
	}, []);

	useEffect(() => {
		let data = socketMessages.pop();
		if (data) {
			switch (data.type) {
				case "connect":
					send({
						type: "login",
						name: "broadcaster",
					});
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
		user.peerConnection = new RTCPeerConnection(IceConfiguration);
		user.peerConnection.onconnectionstatechange = (evt) => {
			console.log("change connection state: ", evt);
		};
		//when remote answere to our offer and we set that in setRemoteDescription
		user.peerConnection.onicecandidate = ({ candidate }) => {
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
			//send incoming msg to each user watching the stream
			if (Object.keys(userRef.current).length > 0) {
				Object.values(userRef.current).forEach((user) => {
					sendMsgOnPeerChannel(
						user.peerConnection,
						user.dataChannel,
						message.data
					);
				});
			}
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
	const closeAlert = () => {
		setAlert(null);
	};
	const send = (data) => {
		if (webSocket.current.readyState) {
			webSocket.current.send(JSON.stringify(data));
		} else {
			setAlert(
				<SweetAlert
					warning
					confirmBtnBsStyle="danger"
					title="Failed"
					// success
					// title="Connection Closed"
					onConfirm={closeAlert}
					onCancel={closeAlert}
				>
					Logged in successfully!
				</SweetAlert>
			);
		}
	};
	const sendMsg = () => {
		let time = formatTime(new Date());
		Object.values(users).forEach((user) => {
			let text = { time, message, name: "broadcaster" };
			sendMsgOnPeerChannel(
				user.peerConnection,
				user.dataChannel,
				JSON.stringify(text)
			);
		});
	};
	const golive = () => {
		webSocket.current = new WebSocket(config.remoteURL);
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
			{alert}
			<div className={classes.container_video}>
				<video autoPlay playsInline ref={videoElement}></video>
				<button onClick={golive}>Go Live</button>
			</div>
			<Messages messages={messages} setMessage={setMessage} sendMsg={sendMsg} />
		</div>
	);
};
export default Breadcaster;

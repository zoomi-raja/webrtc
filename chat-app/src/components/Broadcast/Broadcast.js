import React, { useRef, useEffect, useState } from "react";
import Messages from "../Messages/Messages";
import SweetAlert from "react-bootstrap-sweetalert";
import { formatTime, sendMsgOnPeerChannel } from "../../utility/utility";
import { config, IceConfiguration } from "../../utility/config";
import classes from "./Broadcaste.module.scss";
import { useHistory } from "react-router-dom";

const Breadcast = (props) => {
	let history = useHistory();
	//refrences
	const videoElement = useRef(null);
	const webSocket = useRef(null);
	const userRef = useRef({});
	//states
	const [socketMessages, setSocketMessages] = useState([]);
	const [users, setUsers] = useState({});
	const [usersCount, setUsersCount] = useState(0);
	const [alert, setAlert] = useState(null);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);

	const gotLocalMediaStream = (mediaStream) => {
		videoElement.current.srcObject = mediaStream;
	};

	async function fetchStream() {
		const mediaStreamConstraints = {
			video: true,
			audio: true,
		};
		const result = await navigator.mediaDevices.getUserMedia(
			mediaStreamConstraints
		);
		gotLocalMediaStream(result);
	}
	useEffect(() => {
		userRef.current = { ...users };
	}, [users]);
	useEffect(() => {
		webSocket.current = new WebSocket(config.remoteURL);
		webSocket.current.onmessage = (message) => {
			const data = JSON.parse(message.data);
			setSocketMessages((prev) => [...prev, data]);
		};
		webSocket.current.onclose = () => {
			webSocket.current.close();
		};

		fetchStream();

		return () => {
			if (webSocket.current) {
				webSocket.current.close();
				if (videoElement.current.srcObject) {
					videoElement.current.srcObject.getTracks().forEach(function (track) {
						track.stop();
					});
				}
			}
		};
	}, []);

	useEffect(() => {
		let data = socketMessages.pop();
		if (data) {
			console.log(data);
			switch (data.type) {
				case "connect":
					send({
						action: "login",
						...props.user,
					});
					break;
				case "login":
					onLogin(data);
					break;
				case "NewViewer":
					onGuestJoined(data);
					break;
				case "user-left":
					removeUser(data);
					break;
				case "reconnect":
					let userData = { user: { name: data.name } };
					setTimeout(() => {
						onGuestJoined(userData);
					}, 100);

					break;
				case "answer":
					onAnswer(data);
					break;
				case "already_open":
					setAlert(
						<SweetAlert
							warning
							confirmBtnBsStyle="danger"
							title="Failed"
							onConfirm={() => {
								history.push("/");
							}}
							onCancel={() => {
								history.push("/");
							}}
						>
							close other tab!
						</SweetAlert>
					);
					break;
				default:
					break;
			}
		}
	}, [socketMessages]);
	const onLogin = (data) => {
		// if (data.users.length > 0) {
		// 	setTimeout(() => {
		// 		data.users.forEach((user) => {
		// 			onGuestJoined({ user });
		// 		});
		// 	}, 100);
		// }
		console.log("logedin successfully");
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
			if (candidate) {
				send({
					name: user.name,
					action: "candidate",
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
			action: "offer",
			offer,
			name: user.name,
		});
		setUsersCount((prev) => ++prev);
		setUsers((prev) => {
			return { ...prev, [user.name]: user };
		});
	};

	const removeUser = ({ name }) => {
		setUsersCount((prev) => --prev);
		setUsers((prev) => {
			let users = { ...prev };
			delete users[name];
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
					user is left!
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

	const stopStream = () => {
		send({
			action: "stop-broadcasting",
		});
		props.stopStream();
	};

	return (
		<div className={classes.container}>
			{alert}
			<div className={classes.container_video}>
				<video autoPlay playsInline ref={videoElement}></video>
				<span>{usersCount}</span>
				<button onClick={stopStream}>Stop</button>
			</div>
			<Messages messages={messages} setMessage={setMessage} sendMsg={sendMsg} />
		</div>
	);
};
export default Breadcast;

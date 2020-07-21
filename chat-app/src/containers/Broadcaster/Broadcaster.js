import React, { useRef, useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import classes from "./Broadcaster.module.scss";

const configuration = {
	iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

export default () => {
	//refrences
	const videoElement = useRef(null);
	const webSocket = useRef(null);
	const connectedRef = useRef();
	//states
	const [socketMessages, setSocketMessages] = useState([]);
	const [socketOpen, setSocketOpen] = useState(false);
	const [connection, setconnection] = useState(null);
	const [channel, setChannel] = useState(null);
	const [users, setUsers] = useState([]);
	const [alert, setAlert] = useState(null);

	//temp
	const [connectedTo, setConnectedTo] = useState("");

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
		return () => webSocket.current.close();
	}, []);

	useEffect(() => {
		let data = socketMessages.pop();
		console.log(data);
		if (data) {
			switch (data.type) {
				case "connect":
					console.log(webSocket.current.readyState);
					send({
						type: "login",
						name: "broadcaster",
					});
					setSocketOpen(true);
					break;
				case "login":
					onLogin(data);
					break;
				case "updateUsers":
					updateUsersList(data);
					break;
				case "removeUser":
					removeUser(data);
					break;
				case "offer":
					onOffer(data);
					break;
				//no need of candidate because in answer broadcaster wil send its ice server
				default:
					break;
			}
		}
	}, [socketMessages]);
	const onLogin = (data) => {
		console.log(data);
	};
	const updateUsersList = ({ user }) => {
		setUsers((prev) => [...prev, user]);
	};

	const removeUser = ({ user }) => {
		setUsers((prev) => prev.filter((u) => u.userName !== user.userName));
	};
	const onOffer = ({ offer, name }) => {
		setConnectedTo(name);
		connectedRef.current = name;

		connection
			.setRemoteDescription(new RTCSessionDescription(offer))
			.then(() => connection.createAnswer())
			.then((answer) => connection.setLocalDescription(answer))
			.then(() =>
				send({ type: "answer", answer: connection.localDescription, name })
			)
			.catch((e) => {
				console.log({ e });
				setAlert(
					<SweetAlert
						warning
						confirmBtnBsStyle="danger"
						title="Failed"
						onConfirm={closeAlert}
						onCancel={closeAlert}
					>
						An error has occurred.
					</SweetAlert>
				);
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
		let localConnection = new RTCPeerConnection(configuration);
		//when the browser finds an ice candidate we send it to another peer
		localConnection.onicecandidate = ({ candidate }) => {
			let connectedTo = connectedRef.current;

			if (candidate && !!connectedTo) {
				send({
					name: connectedTo,
					type: "candidate",
					candidate,
				});
			}
		};
		localConnection.ondatachannel = (event) => {
			let receiveChannel = event.channel;
			receiveChannel.onopen = () => {
				console.log("Data channel is open and ready to be used.");
			};
			receiveChannel.onmessage = (messag) => {
				console.log(messag);
			};
			setChannel(receiveChannel);
		};
		setconnection(localConnection);
	};
	const closeAlert = () => {
		setAlert(null);
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

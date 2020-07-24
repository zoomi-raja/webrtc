const leadingZero = (value) => {
	return ("0" + value).slice(-2);
};
export const formatTime = (date = false) => {
	if (!date) return false;
	let time =
		"today at " +
		leadingZero(date.getHours()) +
		":" +
		leadingZero(date.getMinutes()) +
		":" +
		leadingZero(date.getSeconds());
	return time;
};

export const sendMsgOnPeerChannel = (peer, channel, msg) => {
	if (peer.connectionState === "connected" && channel.readyState === "open") {
		channel.send(msg);
	}
};

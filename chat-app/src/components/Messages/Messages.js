import React from "react";
import Message from "./Message/Message";
import classes from "./Messages.module.scss";

const Messages = (props) => {
	let msgsHtml = <span>No Msgs</span>;
	if (props.messages.length > 0) {
		msgsHtml = props.messages.map((msg, index) => {
			return <Message message={msg} key={index} />;
		});
	}
	return (
		<div className={classes.container_messages}>
			<div className={classes.msg_container}>
				<div className={classes.msg}>{msgsHtml}</div>
			</div>
			<div className={classes.send_msg}>
				<input
					className={classes.send_msg_input}
					onChange={(e) => props.setMessage(e.target.value)}
				></input>
				<button className={classes.send_msg_btn} onClick={props.sendMsg}>
					Send
				</button>
			</div>
		</div>
	);
};

export default Messages;

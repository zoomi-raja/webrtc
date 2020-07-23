import React from "react";
import classes from "./Message.module.scss";

const Message = ({ message }) => {
	return (
		<div className={classes.message}>
			<div className={classes.message_detail}>
				<span className={classes.sender_name}>{message.name}</span>
				<span className={classes.sender_msg}>{message.message}</span>
			</div>
			<span className={classes.message_time}>
				<span>{message.time}</span>
			</span>
		</div>
	);
};

export default Message;

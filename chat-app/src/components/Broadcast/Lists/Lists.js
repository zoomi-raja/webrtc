import React, { useEffect, useState } from "react";
import axios from "../../../utility/axios";
import { config } from "../../../utility/config";
import Item from "./Item/Item";
import classes from "./Lists.module.scss";
const Lists = () => {
	const [broadcasts, setBroadcasts] = useState([]);
	useEffect(() => {
		async function fetchData() {
			const {
				data: { data: result },
			} = await axios.get(`${config.apiURL}broadcasts`);
			if (result.broadcasters.length > 0) {
				setBroadcasts(result.broadcasters);
			}
		}
		fetchData();
	}, []);
	let html = <div className={classes.notice}>No Live Broadcaster</div>;
	if (broadcasts.length > 0) {
		html = broadcasts.map((user, index) => {
			return <Item user={user} key={index} />;
		});
	}
	return (
		<div className={classes.broadcasters}>
			<span>Broadcasts</span>
			<div className={classes.container}>{html}</div>
		</div>
	);
};

export default Lists;

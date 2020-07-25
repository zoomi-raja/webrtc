import React from "react";
import { NavLink } from "react-router-dom";
import classes from "./Header.module.scss";

export default () => {
	return (
		<div className={classes.nav}>
			<NavLink to="/">Home</NavLink>
			{/* <NavLink to="/broadcaster">Broadcast</NavLink>
			<NavLink to="/audience">Audience</NavLink> */}
		</div>
	);
};

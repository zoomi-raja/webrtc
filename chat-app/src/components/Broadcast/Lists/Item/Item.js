import React from "react";
import { Link } from "react-router-dom";
import classes from "./Item.module.scss";
const Item = (props) => {
	return (
		<div className={classes.item}>
			<Link to={`watch/${props.user.name}`}>
				<div className={classes.item__img}>
					<img
						src="https://cdn.pixabay.com/photo/2014/03/29/09/17/cat-300572_960_720.jpg"
						alt="broadcaster"
					/>
				</div>
				<span>{props.user.name}</span>
			</Link>
		</div>
	);
};
export default Item;

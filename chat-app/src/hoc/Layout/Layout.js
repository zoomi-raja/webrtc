import React, { Fragment } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import classes from "./Layout.module.scss";
const layout = (props) => {
	return (
		<Fragment>
			<div className={classes.container}>
				<Header />
				{props.children}
			</div>
			<Footer />
		</Fragment>
	);
};
export default layout;

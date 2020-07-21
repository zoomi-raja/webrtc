import React, { Fragment } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
const layout = (props) => {
	return (
		<Fragment>
			<div>
				<Header />
				{props.children}
			</div>
			<Footer />
		</Fragment>
	);
};
export default layout;

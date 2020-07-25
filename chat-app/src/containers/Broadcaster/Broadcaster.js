import React, { useEffect, useState } from "react";

// import classes from "./Broadcaster.module.scss";
import Broadcast from "../../components/Broadcast/Broadcast";
import BroadcastForm from "../../components/Broadcast/Form/Form";
import SweetAlert from "react-bootstrap-sweetalert";

const Breadcaster = () => {
	const [haveValues, setHaveValues] = useState({});
	const [alert, setAlert] = useState(null);
	useEffect(() => {
		if (localStorage.getItem("broadcaster")) {
			let broadcaster = JSON.parse(localStorage.getItem("broadcaster"));
			setHaveValues(broadcaster);
		}
	}, []);
	const prepareBroadCast = (name, title, tags, category) => {
		if (
			tags.length <= 0 ||
			name.trim() === "" ||
			title.trim === "" ||
			!category
		) {
			setAlert(
				<SweetAlert
					warning
					confirmBtnBsStyle="danger"
					title="Failed"
					onConfirm={closeAlert}
					onCancel={closeAlert}
				>
					All fields required!
				</SweetAlert>
			);
			return;
		}
		let broadcaster = { name, title, tags, category };
		localStorage.setItem("broadcaster", JSON.stringify(broadcaster));
		setHaveValues(broadcaster);
	};
	const closeAlert = () => {
		setAlert(null);
	};
	let html = <BroadcastForm prepareBroadCast={prepareBroadCast} />;
	if (Object.keys(haveValues).length > 0) {
		html = <Broadcast />;
	}
	return (
		<div>
			{alert}
			<h3>Setup Your Stream</h3>
			<div>{html}</div>
		</div>
	);
};
export default Breadcaster;

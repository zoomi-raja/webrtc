import React, { useEffect, useState, useRef } from "react";
import Form from "../../components/Audience/Form/Form";
import SweetAlert from "react-bootstrap-sweetalert";
import Audience from "../../components/Audience/Audience";

const Watch = (props) => {
	const [viewer, setViewer] = useState({});
	const [alert, setAlert] = useState(null);
	//refrence
	const broadcaster = useRef("");
	useEffect(() => {
		broadcaster.current = props.match.params.broadcaster;
		if (localStorage.getItem("viewer")) {
			let viewer = JSON.parse(localStorage.getItem("viewer"));
			if (viewer[broadcaster.current]) {
				setViewer(viewer[broadcaster.current]);
			}
		}
	}, []);
	const prepareViewer = (name) => {
		if (name.trim() === "") {
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
		let viewer = { name, type: "audience", broadcaster: broadcaster.current };
		localStorage.setItem(
			"viewer",
			JSON.stringify({ [broadcaster.current]: viewer })
		);
		setViewer(viewer);
	};
	const closeAlert = () => {
		setAlert(null);
	};
	const stopStream = () => {
		if (localStorage.getItem("viewer")) {
			let viewer = JSON.parse(localStorage.getItem("viewer"));
			delete viewer[broadcaster.current];
			Object.keys(viewer).length > 0
				? localStorage.setItem("viewer", viewer)
				: localStorage.removeItem("viewer");
			setViewer({});
		}
	};
	let html = (
		<div>
			<h3>Enter Your Detail</h3>
			<Form prepareViewer={prepareViewer} />
		</div>
	);
	if (Object.keys(viewer).length > 0) {
		html = <Audience user={viewer} stopStream={stopStream} />;
	}
	return (
		<div style={{ padding: "20px" }}>
			{alert}
			{html}
		</div>
	);
};
export default Watch;

import React, { useState } from "react";
import classes from "./Form.module.scss";
const Form = (props) => {
	const [name, setName] = useState("");
	const submitForm = (e) => {
		e.preventDefault();
		props.prepareViewer(name);
	};
	return (
		<form className={classes.form} onSubmit={submitForm}>
			<div className={classes.form_group}>
				<label htmlFor="name">name</label>
				<input
					type="text"
					name="name"
					id="name"
					onChange={(event) => {
						setName(event.target.value);
					}}
				/>
			</div>
			<button className="btn btn--primary btn--small">
				GO
				<svg
					style={{ fill: "currentColor", marginLeft: "15px" }}
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
				>
					<path d="M24 12l-9-8v6h-15v4h15v6z" />
				</svg>
			</button>
		</form>
	);
};
export default Form;

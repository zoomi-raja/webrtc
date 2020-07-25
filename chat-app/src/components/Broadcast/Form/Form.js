import React, { useRef, useEffect, useState } from "react";
import ReactTags from "react-tag-autocomplete";
import classes from "./Form.module.scss";

const Form = (props) => {
	const [tags, setTags] = useState([
		{ id: 1, name: "Apples" },
		{ id: 2, name: "Pears" },
	]);
	const [suggestions, setSuggestions] = useState([]);
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	//refrences
	const reactTags = useRef();
	//
	useEffect(() => {
		setSuggestions([
			{ id: 3, name: "Bananas" },
			{ id: 4, name: "Mangos" },
			{ id: 5, name: "Lemons" },
			{ id: 6, name: "Apricots" },
		]);
	}, []);
	const submitForm = (e) => {
		e.preventDefault();
		props.prepareBroadCast(name, title, tags, category);
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
			<div className={classes.form_group}>
				<label htmlFor="title">title</label>
				<input
					type="text"
					name="title"
					id="title"
					onChange={(event) => {
						setTitle(event.target.value);
					}}
				/>
			</div>
			<div className={classes.form_group}>
				<label htmlFor="tags">tags</label>
				<ReactTags
					placeholderText="Tags"
					ref={reactTags}
					tags={tags}
					suggestions={suggestions}
					onDelete={(i) => {
						const t = [...tags];
						t.splice(i, 1);
						setTags(t);
					}}
					onAddition={(tag) => {
						alert(tag);
						const t = tags.concat(tag);
						setTags(t);
					}}
					type="text"
					name="tags"
					id="tags"
				/>
			</div>
			<div className={`${classes.form_group} ${classes.select}`}>
				<label htmlFor="category">Category *</label>
				<select
					name="category"
					id="category"
					onChange={(event) => {
						setCategory(event.target.value);
					}}
				>
					<option value="all">All</option>
					<option value="jeux">Jeux</option>
					<option value="music">music</option>
					<option value="freestyle">FreeStyle</option>
				</select>
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

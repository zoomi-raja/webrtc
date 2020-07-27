import React from "react";
import BroadcastList from "../../components/Broadcast/Lists/Lists";
import classes from "./Home.module.scss";
const Home = (props) => {
	const goLive = () => {
		props.history.push("broadcaster");
	};
	return (
		<div className={classes.container}>
			<div className={classes.top}>
				<button onClick={goLive}>GoLive</button>
			</div>
			<div className={classes.main_section}>
				<div className={classes.filters}>
					<h3>Categories</h3>
					<div className={classes.category}>
						<div className={classes.form_input}>
							<input type="radio" name="category" id="category_all" />
							<label htmlFor="category_all">All</label>
						</div>
						<div className={classes.form_input}>
							<input type="radio" name="category" id="category_jeux" />
							<label htmlFor="category_jeux">Jeux</label>
						</div>
						<div className={classes.form_input}>
							<input type="radio" name="category" id="category_music" />
							<label htmlFor="category_music">Music</label>
						</div>
						<div className={classes.form_input}>
							<input type="radio" name="category" id="category_free_style" />
							<label htmlFor="category_free_style">FreeStyle</label>
						</div>
					</div>
					<h3>Tags</h3>
					<div className={classes.tag}>
						<div className={classes.form_input}>
							<input type="checkbox" name="tags_all" id="tags_all" />
							<label htmlFor="tags_all">All</label>
						</div>
						<div className={classes.form_input}>
							<input type="checkbox" name="tags_pc" id="tags_pc" />
							<label htmlFor="tags_pc">PC</label>
						</div>
						<div className={classes.form_input}>
							<input type="checkbox" name="tags_ps5" id="tags_ps5" />
							<label htmlFor="tags_ps5">PS5</label>
						</div>
					</div>
				</div>
				<BroadcastList />
			</div>
		</div>
	);
};

export default Home;

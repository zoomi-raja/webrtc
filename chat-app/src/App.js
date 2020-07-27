import React from "react";
import Broadcaster from "./containers/Broadcaster/Broadcaster";
import Watch from "./containers/Watch/Watch";
import Home from "./containers/Home/Home";
import NotFound from "./components/Notfound/Notfound";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Layout from "./hoc/Layout/Layout";

const App = () => {
	return (
		<BrowserRouter>
			<Layout>
				<Switch>
					<Route path="/broadcaster" component={Broadcaster} />
					<Route path="/watch/:broadcaster" component={Watch} />
					<Route path="/" exact component={Home} />
					<Route path="*" component={NotFound} />
				</Switch>
			</Layout>
		</BrowserRouter>
	);
};

export default App;

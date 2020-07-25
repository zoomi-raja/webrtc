const express = require("express");
const router = express.Router();

const registerRoute = (userMap) => {
	router.get("/", (req, res) => {
		if (userMap.size > 0) {
			let broadcasters = [];
			for (let { user } of userMap.values()) {
				if (!user.intrepted) broadcasters.push({ ...user });
			}
			res.status(200).json({ status: "success", data: { broadcasters } });
		} else {
			res.status(200).json({ status: "success", data: { broadcasters: [] } });
		}
	});
	return router;
};

module.exports = registerRoute;

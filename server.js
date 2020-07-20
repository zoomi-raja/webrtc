const app = require("./app");
const port = process.env.PORT || 9000;

//start our server
app.listen(port, () => {
	console.log(`Signalling Server running on port: ${port}`);
});

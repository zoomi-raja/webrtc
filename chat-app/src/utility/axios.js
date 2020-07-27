import axios from "axios";
import { config } from "../utility/config";

const instance = axios.create({
	baseURL: config.apiURL,
	headers: { "Content-Type": "application/json" },
});

export default instance;

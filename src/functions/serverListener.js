import express from 'express';

import { MESSAGES, PORTS } from "../constants.js";

export const serverListener = () => {
	const app = express();
	const port = process.env.PORT || PORTS.DEFAULT_PORT;

	app.listen(port, () => {
		console.log(`${MESSAGES.RUNNING_ON_PORT_MESSAGE} ${port}`);
	});
}

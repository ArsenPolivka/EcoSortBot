import { getWasteData } from "../api/wasteData.js";
import { bot } from "../App.js";
import { MESSAGES } from "../constants.js";

export const sendWasteTypes = async (chatId) => {
	const wasteData = await getWasteData();
	const wasteTypes = Object.keys(wasteData);
	const keyboard = wasteTypes.map(type => [{ text: type }]);

	await bot.sendMessage(chatId, MESSAGES.CHOOSE_TYPE_MESSAGE, {
		reply_markup: {
			keyboard: keyboard,
			one_time_keyboard: false,
			resize_keyboard: true
		}
	});
}

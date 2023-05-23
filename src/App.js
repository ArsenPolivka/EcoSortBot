import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

import { getWasteData } from "./api/wasteData.js";
import { sendWasteTypes } from "./functions/sendWasteTypes.js";
import { generateResponseMessage } from "./functions/generateResponseMessage.js";
import { serverListener } from './functions/serverListener.js';

import { MESSAGES, COMMANDS } from './constants.js';

dotenv.config();
const token = process.env.TELEGRAM_API_TOKEN;
export const bot = new TelegramBot(token, { polling: true });
serverListener();

bot.onText(COMMANDS.START_COMMAND, async (msg) => {
	const chatId = msg.chat.id;

	await bot.sendMessage(chatId,
			MESSAGES.START_MESSAGE,
			{
				parse_mode: 'Markdown',
				disable_web_page_preview: true
			}
	);

	await sendWasteTypes(chatId);
});

bot.on('message', async (msg) => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text.startsWith('/')) {
		return;
	}

	if (text === COMMANDS.BACK_COMMAND) {
		await sendWasteTypes(chatId);
		return;
	}

	const wasteData = await getWasteData();

	if (wasteData[text]) {
		const subtypes = Object.keys(wasteData[text]);
		const keyboard = [[{ text: COMMANDS.BACK_COMMAND }]].concat(subtypes.map(subtype => [{ text: subtype }]));

		await bot.sendMessage(chatId, MESSAGES.CHOOSE_SUBTYPE_MESSAGE, {
			reply_markup: {
				keyboard: keyboard,
				one_time_keyboard: false,
				resize_keyboard: true
			}
		});
	} else {
		let found = false;

		for (const wasteType in wasteData) {
			if (wasteData[wasteType][text]) {
				const info = wasteData[wasteType][text];
				const message = generateResponseMessage(text, info);

				await bot.sendMessage(chatId, message);
				found = true;
				break;
			}
		}

		if (found) {
			await sendWasteTypes(chatId);
		} else {
			await bot.sendMessage(chatId, MESSAGES.ERROR_MESSAGE);
		}
	}
});

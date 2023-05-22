const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');
require('dotenv').config();

const token = process.env.TELEGRAM_API_TOKEN;
const poolCredentials = JSON.parse(process.env.DATABASE_POOL_CREDENTIALS);
const bot = new TelegramBot(token, { polling: true });

const pool = new Pool(poolCredentials);

async function getWasteData() {
	const wasteTypesResult = await pool.query('SELECT * FROM waste_types');
	const wasteSubtypesResult = await pool.query('SELECT * FROM waste_subtypes');

	const wasteData = {};

	wasteTypesResult.rows.forEach((type) => {
		wasteData[type.name] = {};
	});

	wasteSubtypesResult.rows.forEach((subtype) => {
		const wasteTypeName = wasteTypesResult.rows.find((type) => type.id === subtype.waste_type_id).name;
		wasteData[wasteTypeName][subtype.name] = {
			is_middle: subtype.is_middle,
			can_sort: subtype.can_sort,
			where_to_throw: subtype.where_to_throw,
			description: subtype.description,
		};
	});

	return wasteData;
}

async function sendWasteTypes(chatId) {
	const wasteData = await getWasteData();
	const wasteTypes = Object.keys(wasteData);
	const keyboard = wasteTypes.map(type => [{ text: type }]);

	bot.sendMessage(chatId, 'Оберіть вид сміття:', {
		reply_markup: {
			keyboard: keyboard,
			one_time_keyboard: false,
			resize_keyboard: true
		}
	});
}

bot.onText(/\/start/, async (msg) => {
	const chatId = msg.chat.id;
	await bot.sendMessage(chatId, 'Привіт! Я твій сміттєсортувальний помічник 🗑️🌱\n\nГотовий допомогти тобі із сортування відходів та надати інформацію про їх переробку ♻.');
	sendWasteTypes(chatId);
});


bot.on('message', async (msg) => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text.startsWith('/')) {
		return;
	}

	if (text === '⬅ Назад') {
		sendWasteTypes(chatId);
		return;
	}

	const wasteData = await getWasteData();

	if (wasteData[text]) {
		const subtypes = Object.keys(wasteData[text]);
		const keyboard = [[{ text: '⬅ Назад' }]].concat(subtypes.map(subtype => [{ text: subtype }]));

		bot.sendMessage(chatId, 'Оберіть підвид сміття:', {
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

				const message = `🗑 ${text}\n\n${info.is_middle ? '🔶' : info.can_sort ? '✅' : '❌'} ${info.where_to_throw}\n\n♻ ${info.description}.`;
				await bot.sendMessage(chatId, message);
				found = true;
				break;
			}
		}

		if (found) {
			sendWasteTypes(chatId);
		} else {
			bot.sendMessage(chatId, 'Вибачте, я не розумію вашого запиту. Будь ласка, спобуйте ще раз.');
		}
	}
});

const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const token = process.env.TELEGRAM_API_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getWasteData() {
	const { data: wasteTypesResult, error: wasteTypesError } = await supabase
			.from('waste_types')
			.select('*');
	const { data: wasteSubtypesResult, error: wasteSubtypesError } = await supabase
			.from('waste_subtypes')
			.select('*');

	if (wasteTypesError || wasteSubtypesError) {
		console.error('Error fetching waste data:', wasteTypesError || wasteSubtypesError);
		return null;
	}

	const wasteData = {};

	wasteTypesResult.forEach(({name}) => {
		wasteData[name] = {};
	});

	wasteSubtypesResult.forEach(({name, can_sort, is_middle, where_to_throw, waste_type_id, description}) => {
		const wasteTypeName = wasteTypesResult.find(({id}) => id === waste_type_id).name;

		wasteData[wasteTypeName][name] = {
			is_middle: is_middle,
			can_sort: can_sort,
			where_to_throw: where_to_throw,
			description: description,
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

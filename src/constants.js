export const LINKS = {
	SUPPORT_LINK: `https://t.me/arsen444ik`,
};

export const MESSAGES = {
	START_MESSAGE: `Привіт! Я твій сміттєсортувальний помічник 🗑️🌱\n
Готовий допомогти тобі із сортуванням відходів та надати інформацію про їх переробку ♻.\n
🔰 Що ти можеш робити?\n` +
		`     🔹 Переглядати інформацію про сортування різних видів сміття.\n` +
		`     🔹 Знаходити найближчий пункт збору/переробки відходів натиснувши на кнопку «Мапа».\n` +
		'\n' +
		`🔶 Знайшов помилку чи бажаєш доповнити інформацію? Пиши у [підтримку](${LINKS.SUPPORT_LINK}).`,
	ERROR_MESSAGE: 'Вибач, я не розумію твого запиту. Будь ласка, спобуй ще раз.',
	FETCH_ERROR_MESSAGE: 'Error fetching waste data:',
	CHOOSE_TYPE_MESSAGE: 'Обери тип відходів:',
	CHOOSE_SUBTYPE_MESSAGE: 'Обери підтип відходів:',
	RUNNING_ON_PORT_MESSAGE: 'Server is running on port',
};

export const COMMANDS = {
	START_COMMAND: /\/start/,
	BACK_COMMAND: '⬅ Назад',
};

export const PORTS = {
	DEFAULT_PORT: 3000,
};

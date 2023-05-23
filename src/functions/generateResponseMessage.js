export const generateResponseMessage = (text, info) => {
	return `🗑 ${text}\n\n${info.is_middle ? '🔶' : (info.can_sort ? '✅' : '❌')} ${info.where_to_throw}\n\n♻ ${info.description}.`;
}

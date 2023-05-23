import { createClient } from "@supabase/supabase-js";
import { MESSAGES } from "../constants.js";

export const getWasteData = async () => {
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseKey = process.env.SUPABASE_KEY;

	const supabase = createClient(supabaseUrl, supabaseKey);

	const {data: wasteTypesResult, error: wasteTypesError} = await supabase
			.from('waste_types')
			.select('*');

	const {data: wasteSubtypesResult, error: wasteSubtypesError} = await supabase
			.from('waste_subtypes')
			.select('*');

	if (wasteTypesError || wasteSubtypesError) {
		console.error(MESSAGES.FETCH_ERROR_MESSAGE, wasteTypesError || wasteSubtypesError);

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

import { TField, TTypeField } from "src/types/field";
import { slugify } from "src/utils/slugify";

export function createNewField(type: TTypeField, label: string): TField {
	console.log(`criando arquivo com tipo ${type}`)
	const name = slugify(label)
	switch (type) {
		case 'string':
		case 'boolean':
		case 'date':
		case 'url':
		case 'file':
		case 'array':
			return { name, label, type };

		case 'number':
			return { name, label, type, precision: 0 };

		case 'select':
			return { name, label, type, options: [] };

		case 'multiselect':
			return { name, label, type, options: [] };

		case 'conditional':
			return {
				name,
				label,
				type,
				decimal: 0,
				basedOn: '',
				cases: {}
			};

		default:
			throw new Error(`Unsupported field type: ${type}`);
	}
}

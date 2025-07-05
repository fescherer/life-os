import { TTypeField } from "src/types/field";

const chooseType = {
	'string': () => null,
	'number': (type: TTypeField) => null,
	'boolean': (type: TTypeField) => null,
	'date': (type: TTypeField) => null,
	'select': (type: TTypeField) => null,
	'multiselect': (type: TTypeField) => null,
	'url': (type: TTypeField) => null,
	'file': (type: TTypeField) => null,
	'array': (type: TTypeField) => null,
	'conditional': (type: TTypeField) => null,
};

export function giveTypeFields(type: TTypeField) {
	const chooseTypeFn = chooseType[type];
	if (chooseTypeFn) {
		return chooseTypeFn(type);
	} else {
		throw new Error('Operação inválida');
	}
}

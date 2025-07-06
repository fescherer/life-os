import { Setting } from "obsidian";
import { TTypeField } from "src/types/field";

let extraFields: Record<string, Setting> = {}

const chooseType = {
	'string': () => null,
	'number': (container: HTMLDivElement, fields: Record<string, any>) => generateFieldNumber(container, fields),
	'boolean': () => null,
	'date': () => null,
	'select': (container: HTMLDivElement, fields: Record<string, any>) => generateFieldSelect(container, fields),
	'multiselect': () => null,
	'url': () => null,
	'file': () => null,
	'array': () => null,
	'conditional': () => null,
};

export function giveTypeFields(type: TTypeField, container: HTMLDivElement, fields: Record<string, any>) {
	const chooseTypeFn = chooseType[type];
	Object.values(extraFields).map((item) => item.settingEl.remove())
	extraFields = {}
	fields = {}
	if (chooseTypeFn) {
		return chooseTypeFn(container, fields);
	} else {
		throw new Error('Operação inválida');
	}
}

function generateFieldNumber(container: HTMLDivElement, fields: Record<string, any>) {
	extraFields['decimalSetting'] = new Setting(container)
		.setName("Decimal dot")
		.addText(text => {
			text.inputEl.type = "number";
			text.onChange(val => (fields.decimal = val))
		});
}

function generateFieldSelect(container: HTMLDivElement, fields: Record<string, any>) {
	fields.options = []
	extraFields['options'] = new Setting(container)
		.setName("Option Name")
		.addText(text => {
			text.onChange(val => (fields.options.push(val)))
		});
}

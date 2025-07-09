import { Notice, Setting } from "obsidian";
import { TField, TTypeField } from "src/types/field";
import { slugify } from "src/utils/slugify";
import { createNewField } from "./createNewField";

let extraField: Record<string, Setting> = {}

const chooseType = {
	'string': () => null,
	'number': (container: HTMLDivElement, field: TField) => generateFieldNumber(container, field),
	'boolean': () => null,
	'date': () => null,
	'select': (container: HTMLDivElement, field: TField) => generateFieldSelect(container, field),
	'multiselect': (container: HTMLDivElement, field: TField) => generateFieldMultiSelect(container, field),
	'url': () => null,
	'file': () => null,
	'array': () => null,
	'conditional': () => null,
};

export function giveTypeField(type: TTypeField, container: HTMLDivElement, field: TField) {
	const chooseTypeFn = chooseType[type];
	Object.values(extraField).map((item) => item.settingEl.remove())
	extraField = {}
	const newField = createNewField(type, field.label);
	field.label = newField.label
	field.name = newField.name
	field.type = newField.type
	if (chooseTypeFn) {
		return chooseTypeFn(container, field);
	} else {
		throw new Error('Operação inválida');
	}
}

function generateFieldNumber(container: HTMLDivElement, field: TField) {
	if (field.type !== 'number') return
	extraField['decimalSetting'] = new Setting(container)
		.setName("Decimal dot")
		.addText(text => {
			text.inputEl.type = "number";
			text.onChange(val => {
				try {
					field.precision = parseInt(val);
				} catch {
					new Notice('Error Ocurred')
				}
			})
		});
}

function generateFieldSelect(container: HTMLDivElement, field: TField) {
	if (field.type !== 'select') return
	field.options = []
	extraField['options'] = new Setting(container)
		.setName("Option Name")
		.addText(text => {
			text.onChange(val => (field.options.push({ id: slugify(val), title: val })))
		});
}

function generateFieldMultiSelect(container: HTMLDivElement, field: TField) {
	if (field.type !== 'multiselect') return
	field.options = []
	extraField['options'] = new Setting(container)
		.setName("Option Name")
		.addText(text => {
			text.onChange(val => (field.options.push({ id: slugify(val), title: val })))
		});
}

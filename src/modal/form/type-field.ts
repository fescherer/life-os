import { Notice, Setting } from "obsidian";
import { TField, TMultiSelectField, TNumberField, TSelectField, TTypeField } from "src/types/field";
import { slugify } from "src/utils/slugify";

let extraField: Record<string, Setting> = {}

function isNumberField(field: TField): field is TNumberField {
	return field.type === 'number' && 'precision' in field;
}
function isSelectField(field: TField): field is TSelectField {
	return field.type === 'select' && 'options' in field;
}
function isMultiSelectField(field: TField): field is TMultiSelectField {
	return field.type === 'multiselect' && 'options' in field;
}

const chooseType = {
	'string': () => null,
	'number': (container: HTMLDivElement, field: TField) => {
		if (isNumberField(field))
			generateFieldNumber(container, field)
	},
	'boolean': () => null,
	'date': () => null,
	'select': (container: HTMLDivElement, field: TField) => {
		if (isSelectField(field))
			generateFieldSelect(container, field)
	},
	'multiselect': (container: HTMLDivElement, field: TField) => {
		if (isMultiSelectField(field))
			generateFieldMultiSelect(container, field)
	},
	'url': () => null,
	'file': () => null,
	'array': () => null,
	'conditional': () => null,
};

export function giveTypeField(type: TTypeField, container: HTMLDivElement, field: TField) {
	const chooseTypeFn = chooseType[type];
	Object.values(extraField).map((item) => item.settingEl.remove())
	extraField = {}
	field = {
		name: '',
		label: '',
		type: 'string'
	}
	if (chooseTypeFn) {
		return chooseTypeFn(container, field);
	} else {
		throw new Error('Operação inválida');
	}
}

function generateFieldNumber(container: HTMLDivElement, field: TNumberField) {
	extraField['decimalSetting'] = new Setting(container)
		.setName("Decimal dot")
		.addText(text => {
			text.inputEl.type = "number";
			text.onChange(val => {
				try {
					(field.precision = parseInt(val))
				} catch {
					new Notice('Error Ocurred')
				}
			})
		});
}

function generateFieldSelect(container: HTMLDivElement, field: TSelectField) {
	field.options = []
	extraField['options'] = new Setting(container)
		.setName("Option Name")
		.addText(text => {
			text.onChange(val => (field.options.push({ id: slugify(val), title: val })))
		});
}

function generateFieldMultiSelect(container: HTMLDivElement, field: TMultiSelectField) {
	field.options = []
	extraField['options'] = new Setting(container)
		.setName("Option Name")
		.addText(text => {
			text.onChange(val => (field.options.push({ id: slugify(val), title: val })))
		});
}

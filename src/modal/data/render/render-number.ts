import { Setting } from "obsidian";
import { TDataItem } from "src/types/data";
import { TNumberField } from "src/types/field";

export function renderNumberData(field: TNumberField, dataItem: TDataItem, contentEl: HTMLElement) {
	new Setting(contentEl)
		.setName(field.label)
		.addText(numberField => {
			numberField.setValue(dataItem[field.name] ? dataItem[field.name] : '')
			numberField.inputEl.type = "number";
			numberField.setPlaceholder('Type a number')
			const precision = (field as TNumberField).precision;
			numberField.inputEl.step = (1 / Math.pow(10, precision)).toString();

			numberField.onChange(val => {
				const parsed = parseFloat(val);
				dataItem[field.name] = isNaN(parsed) ? 'undefined' : parsed.toString();
			})
		});
}

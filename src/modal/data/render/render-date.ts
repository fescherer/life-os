import { Setting } from "obsidian";
import { TDataItem } from "src/types/data";
import { TCommonField } from "src/types/field";

export function RenderDateData(field: TCommonField, dataItem: TDataItem, contentEl: HTMLElement) {
	new Setting(contentEl)
		.setName(field.label)
		.addText(dateField => {
			const date = new Date()
			const defaultDate = dataItem[field.name] ? dataItem[field.name].split("T")[0] : date.toISOString().split("T")[0]

			dateField.setValue(defaultDate)
			dateField.inputEl.type = "date";
			dateField.onChange(val => {
				dateField.setPlaceholder('Type a date')
				const isoString = new Date(val).toISOString();
				dataItem[field.name] = isoString;
			});
		});
}

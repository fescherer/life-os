import { Setting } from "obsidian";
import { TDataItem } from "src/types/data";
import { TCommonField } from "src/types/field";

export function RenderStringData(field: TCommonField, dataItem: TDataItem, contentEl: HTMLElement) {
	new Setting(contentEl).setName(field.label)
		.addTextArea(stringField => {
			stringField.setValue(dataItem[field.name] ? dataItem[field.name] : '')
			stringField.onChange(val => (dataItem[field.name] = val))
				.setPlaceholder('Type a text')
			stringField.inputEl.style.resize = 'vertical'
			stringField.inputEl.style.width = '100%'
		});
}

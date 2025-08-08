import { Setting } from "obsidian";
import { TDataItem } from "src/types/data";
import { TCommonField } from "src/types/field";

export function renderBooleanData(field: TCommonField, dataItem: TDataItem, contentEl: HTMLElement) {
	new Setting(contentEl)
		.setName(field.label)
		.addToggle(booleanField => {
			const defaultBoolean = dataItem[field.name] ? dataItem[field.name] : ''
			booleanField.setValue(!!defaultBoolean)
			booleanField.onChange(val => (dataItem[field.name] = val.toString()))
		})
}

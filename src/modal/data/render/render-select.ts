import { Setting } from "obsidian";
import { TDataItem } from "src/types/data";
import { TSelectField } from "src/types/field";

export function renderSelectData(field: TSelectField, dataItem: TDataItem, contentEl: HTMLElement) {
	new Setting(contentEl).
		setName(field.label)
		.addDropdown(dropdown => {
			const options = field.options.reduce<Record<string, string>>((acc, item) => {
				acc[item.title] = item.title
				return acc
			}, {})

			dropdown
				.setValue(dataItem[field.name] ? dataItem[field.name] : options[Object.keys(options)[0]])
				.addOptions((options))
				.onChange(val => (dataItem[field.name] = val))
		})
}

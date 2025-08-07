import { Setting } from "obsidian";
import { TDataItem } from "src/types/data";
import { TCommonField } from "src/types/field";

export function RenderUrlData(field: TCommonField, dataItem: TDataItem, contentEl: HTMLElement) {
	const defaultURL = dataItem[field.name] ? dataItem[field.name].split('|') : ''

	let urlPrefix = defaultURL[0] || 'https://'
	let url = defaultURL[1] || ''

	new Setting(contentEl)
		.setName(field.label)
		.addText(text1 => {
			text1
				.setValue(urlPrefix)
				.setPlaceholder("Prefix")
				.onChange(value => {
					urlPrefix = value;
					dataItem[field.name] = `${urlPrefix}|${url}`;
				});
		})
		.addText(text2 => {
			text2
				.setPlaceholder("URL")
				.setValue(url || "")
				.onChange(value => {
					url = value;
					dataItem[field.name] = `${urlPrefix}|${url}`;
				});
		});
}

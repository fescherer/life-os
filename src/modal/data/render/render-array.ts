import { Setting } from "obsidian";
import { TDataItem } from "src/types/data";
import { TBaseField } from "src/types/field";

export function RenderArrayData(field: TBaseField, dataItem: TDataItem, wrapper: HTMLElement) {
	new Setting(wrapper).setName(field.label).setDesc('Use comma (,) to separate itens')
		.addText(text => text.setValue(dataItem[field.name] ? dataItem[field.name] : '').onChange(val => {
			dataItem[field.name] = val

			const data = val.split(',')
			container.empty()
			data.map((item) => {
				container.createDiv({ cls: 'array-item', text: item })
			})
		}));

	const container = wrapper.createDiv()
}

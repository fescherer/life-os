import { Setting } from "obsidian";
import { TBaseField, TCommonField } from "src/types/field";

export function RenderArrayData(field: TBaseField, wrapper: HTMLElement) {
    new Setting(wrapper).setName(field.label).setDesc('Use comma (,) to separate itens')
        .addText(text => text.setValue(this.dataItem[field.name] ? this.dataItem[field.name] : '').onChange(val => {
            this.dataItem[field.name] = val

            const data = val.split(',')
            container.empty()
            data.map((item) => {
                container.createDiv({ cls: 'array-item', text: item })
            })
        }));

    const container = wrapper.createDiv()
}

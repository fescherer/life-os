import { Setting } from "obsidian";
import { TCommonField } from "src/types/field";

export function RenderStringData(field: TCommonField, contentEl: HTMLElement) {
    new Setting(contentEl).setName(field.label)
        .addTextArea(stringField => {
            stringField.setValue(this.dataItem[field.name] ? this.dataItem[field.name] : '')
            stringField.onChange(val => (this.dataItem[field.name] = val))
                .setPlaceholder('Type a text')
            stringField.inputEl.style.resize = 'vertical'
            stringField.inputEl.style.width = '100%'
        });
}

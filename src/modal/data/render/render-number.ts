import { Setting } from "obsidian";
import { TNumberField } from "src/types/field";

export function RenderNumberData(field: TNumberField, contentEl: HTMLElement) {
    new Setting(contentEl).setName(field.label)
        .addText(numberField => {
            numberField.setValue(this.dataItem[field.name] ? this.dataItem[field.name] : '')
            numberField.inputEl.type = "number";
            numberField.setPlaceholder('Type a number')
            const precision = (field as TNumberField).precision;
            numberField.inputEl.step = (1 / Math.pow(10, precision)).toString();

            numberField.onChange(val => {
                const parsed = parseFloat(val);
                this.dataItem[field.name] = isNaN(parsed) ? 'undefined' : parsed.toString();
            })
        });
}

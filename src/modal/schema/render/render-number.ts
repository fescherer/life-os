import { Notice, Setting } from "obsidian";
import { TNumberField } from "src/types/field";

export function renderNumber(field: TNumberField, container: HTMLElement) {
    if (!field.precision) field.precision = 0

    new Setting(container)
        .setName("Decimal dot")
        .addText(text => {
            text.inputEl.type = "number";
            text.setValue(field ? field.precision.toString() : '0')
            text.onChange(val => {
                try {
                    field.precision = parseInt(val);
                } catch {
                    new Notice('Error Ocurred')
                }
            })
        });
}
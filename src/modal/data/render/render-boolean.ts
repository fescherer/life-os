import { Setting } from "obsidian";
import { TCommonField } from "src/types/field";

export function RenderBooleanData(field: TCommonField, contentEl: HTMLElement) {
    new Setting(contentEl).setName(field.label).addToggle(booleanField => {
        const defaultBoolean = this.dataItem[field.name] ? this.dataItem[field.name] : ''
        booleanField.setValue(!!defaultBoolean)
        booleanField.onChange(val => (this.dataItem[field.name] = val.toString()))
    })
}

import { Setting } from "obsidian";
import { TSelectField } from "src/types/field";

export function RenderSelectData(field: TSelectField, contentEl: HTMLElement) {
    new Setting(contentEl).setName(field.label).addDropdown(dropdown => {
        const options = field.options.reduce<Record<string, string>>((acc, item) => {
            acc[item.title] = item.title
            return acc
        }, {})

        dropdown
            .setValue(this.dataItem[field.name] ? this.dataItem[field.name] : options[Object.keys(options)[0]])
            .addOptions((options))
            .onChange(val => (this.dataItem[field.name] = val))
    })
}

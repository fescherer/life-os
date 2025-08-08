import { App, Setting } from "obsidian";
import { TDataItem } from "src/types/data";
import { TCommonField } from "src/types/field";
import { slugify } from "src/utils/slugify";

export async function renderMarkdownData(app: App, dataItem: TDataItem, field: TCommonField, container: HTMLElement) {
    const file = `md/${slugify(dataItem.name)}-${dataItem.id}-${field.id}.md`
    dataItem[field.name] = file
    const splitted = file.split('/')
    new Setting(container).setName(field.label).then(setting => {
        setting.controlEl.createEl("span", {
            text: `${splitted[0]}/<data-name>${splitted[1]}`,
            cls: "setting-item-description"
        });
    })
}

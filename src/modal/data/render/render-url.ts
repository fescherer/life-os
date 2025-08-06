import { Setting } from "obsidian";
import { TCommonField } from "src/types/field";

export function RenderUrlData(field: TCommonField, contentEl: HTMLElement) {
    const defaultURL = this.dataItem[field.name] ? this.dataItem[field.name].split('|') : ''

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
                    this.dataItem[field.name] = `${urlPrefix}|${url}`;
                });
        })
        .addText(text2 => {
            text2
                .setPlaceholder("URL")
                .setValue(url || "")
                .onChange(value => {
                    url = value;
                    this.dataItem[field.name] = `${urlPrefix}|${url}`;
                });
        });
}
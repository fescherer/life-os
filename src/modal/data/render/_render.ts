import { App, Setting } from "obsidian";
import { TDataItem } from "src/types/data";
import { renderStringData } from "./render-string";
import { renderNumberData } from "./render-number";
import { renderBooleanData } from "./render-boolean";
import { renderDateData } from "./render-date";
import { renderSelectData } from "./render-select";
import { renderUrlData } from "./render-url";
import { renderArrayData } from "./render-array";
import { renderMarkdownData } from "./render-markdown";
import { renderFileData } from "./render-file";
import { createEntityData, updateEntityData } from "src/utils/entity-data-manager";
import { getEntitySchema } from "src/utils/entity-schema-manager";

export async function renderData(app: App, contentEl: HTMLElement, dataItem: TDataItem, isSubmited: boolean, close: () => void, defaultData?: TDataItem) {
	const entitySchema = await getEntitySchema(app)
	if (!entitySchema) return;

	const dialogTitle = defaultData ? 'Edit data' : 'Create data'
	contentEl.createEl("h2", { text: `${dialogTitle} for ${entitySchema.label}` });

	new Setting(contentEl)
		.setName("Data Name")
		.addText(text => {
			text.setValue(dataItem.name)
			text.onChange(val => {
				dataItem.name = val
			})
		});

	const fieldContainer = contentEl.createDiv()
	entitySchema.fields.map(async (field) => {
		switch (field.type) {
			case 'string':
				renderStringData(field, dataItem, fieldContainer)
				break;
			case 'number':
				renderNumberData(field, dataItem, fieldContainer)
				break;
			case 'boolean':
				renderBooleanData(field, dataItem, fieldContainer)
				break;
			case 'date':
				renderDateData(field, dataItem, fieldContainer)
				break;
			case 'select':
				renderSelectData(field, dataItem, fieldContainer)
				break;
			case 'url':
				renderUrlData(field, dataItem, fieldContainer)
				break;
			case 'file':
				renderFileData(app, dataItem, field, fieldContainer)
				break;
			case 'array':
				renderArrayData(field, dataItem, fieldContainer)
				break;
			case 'markdown':
				await renderMarkdownData(dataItem, field, fieldContainer)
				break;
		}
	})

	new Setting(contentEl).addButton(btn => {
		btn.setButtonText(dialogTitle).onClick(async () => {
			let response = null
			if (defaultData) response = await updateEntityData(app, dataItem)
			else response = await createEntityData(app, dataItem)

			isSubmited = !!response
			close()
		})
	})
}

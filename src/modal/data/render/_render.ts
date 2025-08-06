import { App, Setting } from "obsidian";
import { getEntitySchema } from "src/utils/entity-util";
import { TDataItem } from "src/types/data";
import { createData } from "../create-data";
import { RenderStringData } from "./render-string";
import { RenderNumberData } from "./render-number";
import { RenderBooleanData } from "./render-boolean";
import { RenderDateData } from "./render-date";
import { RenderSelectData } from "./render-select";
import { RenderUrlData } from "./render-url";
import { RenderArrayData } from "./render-array";
import { RenderMarkdownData } from "./render-markdown";
import { RenderFileData } from "./render-file";

export async function RenderData(app: App, contentEl: HTMLElement, dataItem: TDataItem, entityCountId: number, isSubmited: boolean, defaultData?: TDataItem) {
	const entitySchema = await getEntitySchema(app)

	const dialogTitle = defaultData ? '' : 'Create'
	contentEl.createEl("h2", { text: `${dialogTitle} data for ${entitySchema.label}` });

	new Setting(contentEl)
		.setName("Data Name")
		.addText(text => {
			text.setValue(dataItem.name)
			text.onChange(val => {
				dataItem.name = val
				// renderFields(app, dataItem, entitySchema, fieldContainer)
			})
		});

	const fieldContainer = contentEl.createDiv()
	entitySchema.fields.map(async (field) => {
		switch (field.type) {
			case 'string':
				RenderStringData(field, fieldContainer)
				break;
			case 'number':
				RenderNumberData(field, fieldContainer)
				break;
			case 'boolean':
				RenderBooleanData(field, fieldContainer)
				break;
			case 'date':
				RenderDateData(field, fieldContainer)
				break;
			case 'select':
				RenderSelectData(field, fieldContainer)
				break;
			case 'url':
				RenderUrlData(field, fieldContainer)
				break;
			case 'file':
				RenderFileData(app, dataItem, field, fieldContainer)
				break;
			case 'array':
				RenderArrayData(field, fieldContainer)
				break;
			case 'markdown':
				await RenderMarkdownData(app, dataItem, field, fieldContainer)
				break;
		}
	})

	new Setting(contentEl).addButton(btn => {
		btn.setButtonText('verify').onClick(async () => {
			await createData(app, dataItem, entityCountId, isSubmited, defaultData)
		})
	})
}

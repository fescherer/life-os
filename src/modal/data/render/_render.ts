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
import { ModalDataForm } from "../modal";
import { Setting } from "obsidian";

export async function renderData(modal: ModalDataForm) {
	const entitySchema = await getEntitySchema(modal.app)
	if (!entitySchema) return;

	const dialogTitle = modal.defaultData ? 'Edit data' : 'Create data'
	modal.contentEl.createEl("h2", { text: `${dialogTitle} for ${entitySchema.label}` });

	new Setting(modal.contentEl)
		.setName("Data Name")
		.addText(text => {
			text.setValue(modal.dataItem.name)
			text.onChange(val => {
				modal.dataItem.name = val
			})
		});

	const fieldContainer = modal.contentEl.createDiv()
	entitySchema.fields.map(async (field) => {
		switch (field.type) {
			case 'string':
				renderStringData(field, modal.dataItem, fieldContainer)
				break;
			case 'number':
				renderNumberData(field, modal.dataItem, fieldContainer)
				break;
			case 'boolean':
				renderBooleanData(field, modal.dataItem, fieldContainer)
				break;
			case 'date':
				renderDateData(field, modal.dataItem, fieldContainer)
				break;
			case 'select':
				renderSelectData(field, modal.dataItem, fieldContainer)
				break;
			case 'url':
				renderUrlData(field, modal.dataItem, fieldContainer)
				break;
			case 'file':
				renderFileData(modal.app, modal.dataItem, field, fieldContainer)
				break;
			case 'array':
				renderArrayData(field, modal.dataItem, fieldContainer)
				break;
			case 'markdown':
				await renderMarkdownData(modal.dataItem, field, fieldContainer)
				break;
		}
	})

	new Setting(modal.contentEl).addButton(btn => {
		btn.setButtonText(dialogTitle).onClick(async () => {
			let response = null
			if (modal.defaultData) response = await updateEntityData(modal.app, modal.dataItem)
			else response = await createEntityData(modal.app, modal.dataItem)
			console.log(`response`, response)
			modal.isSubmited = !!response
			if (modal.isSubmited) modal.close()
		})
	})
}

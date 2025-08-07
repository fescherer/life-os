import { TData, TDataItem } from "src/types/data";
import { TEntity } from "src/types/field";
import { getEntityData, getEntitySchema } from "src/utils/entity-util";
import { renderMarkdownCardView } from "./render-markdown";
import { App, Notice, TFile } from "obsidian";
import { getCurrentFolder } from "src/utils/folderName";
import { addContextMenu } from "src/views/add-context-menu";
import { CardInteractionManager } from "../card-interation";
import DynamicInterfacePlugin from "main";
import { Card } from "../card";

export async function renderCardView(app: App, entityData: TData, contentEl: HTMLElement, entitySchema: TEntity, render: () => Promise<void>, plugin: DynamicInterfacePlugin) {
	const cardContainer = contentEl.createDiv({ cls: 'card-container' })
	plugin.interactionManager = new CardInteractionManager(this.app, cardContainer);

	entityData.data.map(async (data, index, allData) => {
		const card = new Card(this.app, data, cardContainer, entitySchema)
		card.render()

		// addContextMenu(app, card, data, render)

		// Object.keys(data).map(fieldName => {
		// 	const fieldType = entitySchema.fields.find((field) => field.name === fieldName)
		// 	if (!fieldType) return

		// 	switch (fieldType.type) {
		// 		case 'string':
		// 			card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
		// 			break;
		// 		case 'number':
		// 			card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
		// 			break;
		// 		case 'boolean':
		// 			card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
		// 			break;
		// 		case 'date':
		// 			card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
		// 			break;
		// 		case 'select':
		// 			card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
		// 			break;
		// 		case 'url':
		// 			card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
		// 			break;
		// 		case 'file':
		// 			card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
		// 			break;
		// 		case 'array':
		// 			card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
		// 			// const arrayContainer = card.createDiv()
		// 			// data[fieldName].toString().split(',').map(item => {
		// 			// 	arrayContainer.createDiv({ text: item, cls: 'card-array-item' })
		// 			// })

		// 			break;
		// 		case 'markdown':
		// 			renderMarkdownCardView(card, data, fieldName, entitySchema)
		// 			break;
		// 		default:
		// 			console.warn('No item')
		// 			break;
		// 	}
		// })
	})
}



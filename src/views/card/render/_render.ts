import { TData, TDataItem } from "src/types/data";
import { TEntity } from "src/types/field";
import { getEntityData, getEntitySchema } from "src/utils/entity-util";
import { renderMarkdownCardView } from "./render-markdown";
import { App, Notice, TFile } from "obsidian";
import { getCurrentFolder } from "src/utils/folderName";
import { addContextMenu } from "src/views/add-context-menu";

export async function renderCardView(app: App, entityData: TData, contentEl: HTMLElement, entitySchema: TEntity, render: () => Promise<void>) {
	const cardContainer = contentEl.createDiv({ cls: 'card-container' })

	entityData.data.map(async (data, index, allData) => {
		const card = cardContainer.createDiv({ cls: "card" });
		await renderCardHeader(app, card, data, entitySchema)

		addContextMenu(app, card, data, render)

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

async function renderCardHeader(app: App, card: HTMLElement, data: TDataItem, entitySchema: TEntity) {
	// const btnContainer = card.createDiv({ cls: "btn-container" })
	// btnContainer.createEl("span", { text: `Field Index: ${index.toString()}` });

	// const btnEdit = btnContainer.createEl("button", { cls: "icon-button" });
	// setIcon(btnEdit, "pencil");
	// btnEdit.onclick = () => {
	// 	new ModalDataForm(this.app, data).open();
	// }

	// const btnRemove = btnContainer.createEl("button", { cls: "icon-button" });
	// setIcon(btnRemove, "trash");
	// btnRemove.onclick = () => {
	// 	new ConfirmDialog(this.app,
	// 		'Do you want to remove this item?',
	// 		async () => {
	// 			const currentFolder = await getCurrentFolder(this.app)
	// 			const entityData = await getEntityData(this.app)

	// 			const newData = entityData.data.filter((item) => item.id !== data.id)
	// 			const jsonString = JSON.stringify({ ...entityData, data: newData }, null, 2);

	// 			if (currentFolder)
	// 				await updateMDFile(this.app.vault, `${currentFolder}/data.md`, jsonString)
	// 			new Notice(`You hve deleted an item from ${entityData.label}`)
	// 		}, () => {

	// 		}).open()
	// 	this.onOpen()
	// }

	// const fileImage = this.app.vault.getAbstractFileByPath(`${targetPath}/${fileName}`)
	// if (fileImage && fileImage instanceof TFile) {
	// 	const img = document.createElement("img");
	// 	img.src = path;
	// 	imageContainer.appendChild(img);
	// }

	card.createEl("span", { text: data.name });
	const imageField = entitySchema.fields.find((field) => field.type == 'file')
	const imageContainer = card.createDiv({ cls: 'image-card-container' })
	if (imageField) {
		// TODO Make img-cover style
		const currentFolder = await getCurrentFolder(app)
		const image = app.vault.getAbstractFileByPath(`${currentFolder}/${data[imageField.name]}`)
		if (image && image instanceof TFile) {
			const imagePath = app.vault.getResourcePath(image);
			imageContainer.createEl('img', {
				cls: 'card-image',
				attr: {
					src: imagePath,
					width: "200",
					loading: 'lazy'
				}
			})
		} else {
			new Notice('An error has occured')
		}
	}
}

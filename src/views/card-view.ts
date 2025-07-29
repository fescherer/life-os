import { ItemView, Notice, setIcon, WorkspaceLeaf } from "obsidian";
import { ModalDataForm } from "src/modal/data/data-modal";
import { TDataItem } from "src/types/data";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";
import { getEntityData, getEntitySchema, } from "src/utils/entity-util";
import { getCurrentFolder } from "src/utils/folderName";
import { updateMDFile } from "src/utils/markdown-manager";

export const CARD_VIEW_TYPE = "card-view";

// TODO make page dynamically updates

export class CardView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return CARD_VIEW_TYPE;
	}

	getDisplayText() {
		return "Card View";
	}

	async onOpen() {
		const { contentEl } = this;

		const entitySchema = await getEntitySchema(this.app)
		const entityData = await getEntityData(this.app)

		contentEl.empty();
		contentEl.createEl("h2", { text: `Hello! You are seeing schema of ${entityData.label}` });

		const btnAddNewData = contentEl.createEl("button", { cls: "icon-button" });
		const iconEl = btnAddNewData.createSpan();
		setIcon(iconEl, "plus");
		iconEl.style.marginRight = "0.5em";
		btnAddNewData.createSpan({ text: "Add data" });
		btnAddNewData.onclick = () => this.addOrEditCardItem()

		const cardContainer = contentEl.createDiv({ cls: 'card-container ' })

		entityData.data.map((data, a, b) => {
			console.log("data: ", data, a, b)
			const card = cardContainer.createDiv({ cls: "card" });
			const btnContainer = card.createDiv({ cls: "btn-container" })

			const btnEdit = btnContainer.createEl("button", { cls: "icon-button" });
			setIcon(btnEdit, "pencil");
			btnEdit.onclick = () => this.addOrEditCardItem(data)

			const btnRemove = btnContainer.createEl("button", { cls: "icon-button" });
			setIcon(btnRemove, "trash");
			btnRemove.onclick = () => this.removeCardItem(data)


			card.createEl("h3", { text: `Field Index: ${a.toString()}` });

			const imageField = entitySchema.fields.find((field) => field.type == 'file')
			if (imageField) {
				// If there is a file inside the schema, add a visualization of it 
				// TODO Make img-cover style
				card.createEl('img', {
					cls: 'img-cover',
					attr: {
						src: data[imageField.name] as string,
						width: "200",
						loading: 'lazy'
					}
				})
			}

			Object.keys(data).map(fieldName => {
				const fieldType = entitySchema.fields.find((field) => field.name === fieldName)
				if (!fieldType) return

				switch (fieldType.type) {
					case 'string':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'number':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'boolean':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'date':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'select':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'url':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'file':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'array':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						const arrayContainer = card.createDiv()

						// TODO Guardar tudo como string
						data[fieldName].toString().split(',').map(item => {
							arrayContainer.createDiv({ text: item, cls: 'card-array-item' })
						})

						break;
					case 'markdown':
						const link = contentEl.createEl('button')
						setIcon(link, 'external-link')
						// link.onclick = async () => {

						// 	if (file && file instanceof TFile) {
						// 		await this.app.workspace.getLeaf(true).openFile(file);
						// 	} else {
						// 		new Notice(`File not found.`);
						// 	}
						// }
						break;
					default:
						console.log('No item')
						break;
				}
			})
		})
	}

	async onClose() {
		// Clean up if needed
	}

	removeCardItem(data: TDataItem) {
		console.log('Remove card')
		new ConfirmDialog(this.app,
			'Do you want to remove this item?',
			async () => {
				const currentFolder = await getCurrentFolder(this.app)
				const entityData = await getEntityData(this.app)

				const newData = entityData.data.filter((item) => item.id !== data.id)
				const jsonString = JSON.stringify({ ...entityData, data: newData }, null, 2);

				if (currentFolder)
					await updateMDFile(this.app.vault, `${currentFolder}/data.md`, jsonString)
				new Notice(`You hve deleted an item from ${entityData.label}`)
			}, () => {

			}).open()
		this.onOpen()
	}

	addOrEditCardItem(data?: TDataItem) {
		new ModalDataForm(this.app, data).open();
	}
}








//https://github.com/login?return_to=%2Fobsidianmd%2Fobsidian-sample-plugin

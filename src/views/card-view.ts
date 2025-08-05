import { ItemView, Menu, Notice, setIcon, TFile, WorkspaceLeaf } from "obsidian";
import { getMarkdownFilePath } from "src/modal/data/create-file";
import { ModalDataForm } from "src/modal/data/data-modal";
import { ModalForm } from "src/modal/form/modal";
import { TDataItem } from "src/types/data";
import { TEntity, TFileField } from "src/types/field";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";
import { getEntityData, getEntitySchema, updateEntityFolder, } from "src/utils/entity-util";
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
		this.render()
	}

	async onClose() {
		// Clean up if needed
	}

	private async render() {
		const { contentEl } = this;

		const entitySchema = await getEntitySchema(this.app)
		const entityData = await getEntityData(this.app)

		contentEl.empty();
		this.renderPageHeader(contentEl, entityData.label)

		const cardContainer = contentEl.createDiv({ cls: 'card-container ' })

		entityData.data.map(async (data, index, allData) => {
			console.log("data: ", data, index, allData)
			const card = cardContainer.createDiv({ cls: "card" });
			await this.renderCardHeader(card, data, entitySchema)

			this.addContextMenu(card, data)

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
						// const arrayContainer = card.createDiv()
						// data[fieldName].toString().split(',').map(item => {
						// 	arrayContainer.createDiv({ text: item, cls: 'card-array-item' })
						// })

						break;
					case 'markdown':
						this.renderMarkdown(card, data, fieldName, entitySchema)
						break;
					default:
						console.log('No item')
						break;
				}
			})
		})
	}

	private async renderPageHeader(contentEl: HTMLElement, title: string) {
		contentEl.createEl("h2", { text: `Hello! You are seeing data of ${title} vault` });

		const btnHeaderContainer = contentEl.createDiv({ cls: 'btn-container' })

		const updateRenderView = btnHeaderContainer.createEl("button", { cls: "icon-button" });
		const updateRenderViewIcon = updateRenderView.createSpan();
		setIcon(updateRenderViewIcon, "update");
		updateRenderViewIcon.style.marginRight = "0.5em";
		updateRenderView.createSpan({ text: "Update View" });
		updateRenderView.onclick = () => {
			this.render()
		}

		const btnAddNewData = btnHeaderContainer.createEl("button", { cls: "icon-button" });
		const btnAddNewDataIcon = btnAddNewData.createSpan();
		setIcon(btnAddNewDataIcon, "plus");
		btnAddNewDataIcon.style.marginRight = "0.5em";
		btnAddNewData.createSpan({ text: "Add data" });
		btnAddNewData.onclick = () => {
			new ModalDataForm(this.app).open();
		}

		const entitySchema = await getEntitySchema(this.app)
		const btnEditEntitySchema = btnHeaderContainer.createEl("button", { cls: "icon-button" });
		const btnEditEntitySchemaIcon = btnEditEntitySchema.createSpan();
		setIcon(btnEditEntitySchemaIcon, "pencil");
		btnEditEntitySchemaIcon.style.marginRight = "0.5em";
		btnEditEntitySchema.createSpan({ text: "Edit Entity Schema" });
		btnEditEntitySchema.onclick = () => {
			// Editing entity brings a lot of problems, like, what I am gonna do with the camps that are changed? I am gonna delete those?
			new ModalForm(this.app, async (isValid, result) => {
				console.log("Form data:", result);
				if (isValid) updateEntityFolder(this.app, result)
			}, entitySchema).open();
		}
	}

	private async addContextMenu(card: HTMLElement, data: TDataItem) {
		card.addEventListener("contextmenu", (event) => {
			card.classList.add('card-selected')

			event.preventDefault();
			const menu = new Menu();
			menu.addItem((item) =>
				item.setTitle("Edit").setIcon("pencil").onClick(() => {
					new ModalDataForm(this.app, data).open();
					this.render()
				})
			);
			menu.addItem((item) =>
				item.setTitle("Delete").setIcon("trash").onClick(() => {
					new ConfirmDialog(this.app,
						'Do you want to remove this item?',
						async () => {
							const currentFolder = await getCurrentFolder(this.app)
							const entityData = await getEntityData(this.app)
							const entitySchema = await getEntitySchema(this.app)

							entitySchema.fields.map(async (field) => {
								if (field.type === 'file') {
									const foundFile = this.app.vault.getAbstractFileByPath(`${currentFolder}/files/${data[field.name]}`);

									if (foundFile instanceof TFile) {
										await this.app.vault.delete(foundFile);
									}
								}
								if (field.type === 'markdown') {
									const foundFileMD = this.app.vault.getAbstractFileByPath(`${currentFolder}/${data[field.name]}`);

									if (foundFileMD instanceof TFile) {
										await this.app.vault.delete(foundFileMD);
									}
								}
							})

							const newData = entityData.data.filter((item) => item.id !== data.id)
							const jsonString = JSON.stringify({ ...entityData, data: newData }, null, 2);

							if (currentFolder)
								await updateMDFile(this.app.vault, `${currentFolder}/data.md`, jsonString)
							new Notice(`You have deleted an item from ${entityData.label}`)
							this.render()
						}, () => {

						}).open()
				})
			);

			menu.showAtPosition({ x: event.pageX, y: event.pageY });

			// Add temporary listener to remove the class
			const removeClass = () => {
				card.classList.remove("card-selected");
				window.removeEventListener("pointerdown", removeClass, true);
			};
			window.addEventListener("pointerdown", removeClass, true);
		});
	}

	private async renderCardHeader(card: HTMLElement, data: TDataItem, entitySchema: TEntity) {
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
		// 	console.log('Remove card')
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
		if (imageField) {
			// TODO Make img-cover style
			const currentFolder = await getCurrentFolder(this.app)
			const image = this.app.vault.getAbstractFileByPath(`${currentFolder}/files/${data[imageField.name]}`)
			console.log(image, `${currentFolder}/files/${data[imageField.name]}`)
			if (image && image instanceof TFile) {
				const imagePath = this.app.vault.getResourcePath(image);
				card.createEl('img', {
					cls: 'img-cover',
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

	//TODO Problema, e se tiver dois fields markdown e files? O id sera o mesmo e vai dar pau
	private renderMarkdown(contentEl: HTMLElement, dataItem: TDataItem, fieldName: string, entitySchema: TEntity) {
		const mdContainer = contentEl.createDiv({ cls: 'flex-container' })
		mdContainer.createDiv({ text: `${fieldName}: ` })

		const link = mdContainer.createEl("button", { cls: "icon-button" });
		const linkIcon = link.createSpan();
		setIcon(linkIcon, "external-link");
		linkIcon.style.marginRight = "0.5em";
		link.createSpan({ text: ".md" });

		link.onClickEvent(async () => {
			const field = entitySchema.fields.find(item => item.name === fieldName && item.type === 'markdown')
			if (!field) return
			const filePath = getMarkdownFilePath(field as TFileField, entitySchema, dataItem[fieldName])

			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (file instanceof TFile) {
				const leaf = this.app.workspace.getLeaf(true);
				await leaf.openFile(file);
			} else {
				new Notice(`File not found: ${filePath}`);
			}
		})

	}
}




//https://github.com/login?return_to=%2Fobsidianmd%2Fobsidian-sample-plugin

import { Modal, App, Setting, Notice, setIcon, TFile, TAbstractFile } from "obsidian";
import { TCommonField, TData, TDataItem, TEntity, TMarkdownField, TOptionItem } from "src/types/field";
import { ConfirmDialog } from "src/utils/confirmDialog";
import { getEntityData, getEntitySchema } from "src/utils/entity-util";
import { fileExists, updateMDFile } from "src/utils/markdown-manager";
import { getMarkdownFieldFile, getMarkdownFieldName } from "src/utils/markdownField";

export class ModalDataForm extends Modal {
	dataItem: TDataItem
	isUpdate: boolean

	constructor(app: App, defaultData?: TDataItem) {
		super(app);
		this.isUpdate = defaultData ? true : false
		this.dataItem = defaultData ? defaultData : {
			id: crypto.randomUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	}

	// {
	// 	"entity": "full",
	// 	"label": "Full",
	// 	"data": [
	// 		{
	// 			"title": "String content",
	// 			"weight": 85.6,
	// 			"show-tutorial": true,
	// 			"birthday": "2025-07-01T19:00:20.511Z",
	// 			"reminder": 3600,
	// 			"favorite-food": "cake",
	// 			"tag": ["one-piece", "kimetsu-non-yaiba", "one-punch-man"],
	// 			"site": "https://google.com",
	// 			"thumbnail": "path/to/file/thumb.png",
	// 			"complex-list": [1,3,4,1,5,12,51,2],
	// 			"food": {
	// 					"name": "Red Velvet",
	// 					"quantity": 3
	// 			}
	// 		}
	// 	]
	// }


	async onOpen() {
		const { contentEl } = this;

		const activeFile = this.app.workspace.getActiveFile();
		const currentFolder = activeFile?.parent?.path;
		const file = fileExists(this.app, `${currentFolder}/entity.md`)
		if (!file) {
			contentEl.createEl("h2", { text: "Entity Schema not found!" });
			contentEl.createEl('p', { text: "Make sure you first create an entity schema before trying to create data" })

			new Setting(contentEl)
				.addButton(btn => {
					btn.setButtonText('Ok').onClick(() => this.close())
				})
		} else {

			const entitySchema = await getEntitySchema(this.app)

			const dialogTitle = this.isUpdate ? 'Edit' : 'Create'
			contentEl.createEl("h2", { text: `${dialogTitle} data for ${entitySchema.label}` });
			// TODO Add default values to inputs if there is an update. If user does leave at blank, just update with the default value
			entitySchema.fields.map(async (field) => {
				switch (field.type) {
					case 'string':
						new Setting(contentEl).setName(field.label)
							.addText(text => text.onChange(val => (this.dataItem[field.name] = val)));
						break;
					case 'number':
						new Setting(contentEl).setName(field.label)
							.addText(text => {
								text.inputEl.type = "number";
								text.onChange(val => (this.dataItem[field.name] = val))
							});
						break;
					case 'boolean':
						new Setting(contentEl).addToggle(c => c.onChange(val => (this.dataItem[field.name] = val)))
						break;
					case 'date':
						break;
					case 'select':
						new Setting(contentEl).addDropdown(dropdown => {
							const options = this.getOptionsFormat(field.options)

							dropdown
								.addOptions((options))
								.onChange(val => (this.dataItem[field.name] = val))
						})
						break;
					case 'multiselect':
						new Setting(contentEl).addDropdown(dropdown => {
							const optionsContainer = contentEl.createEl("div");

							let options = this.getOptionsFormat(field.options)
							dropdown
								.addOptions(options)
								.onChange(val => {
									// eslint-disable-next-line @typescript-eslint/no-unused-vars
									const { [val]: _, ...newOptions } = options
									options = newOptions
									optionsContainer
									// this.dataItem[field.name] = val
								})
						})
						break;
					case 'url':
						this.getURL(contentEl, field)
						break;
					case 'file':

						new Setting(contentEl)
							.setName(field.label)
							.addButton((btn) => {
								const imagePathText = contentEl.createDiv();
								btn.setButtonText("Choose File").onClick(() => {
									const fileInput = document.createElement("input");
									fileInput.type = "file";
									fileInput.accept = "*/*"; // You can limit to specific types, e.g., ".pdf" or "image/*"

									fileInput.onchange = async () => {
										if (!fileInput.files || fileInput.files.length === 0) return;

										const file = fileInput.files[0];

										const arrayBuffer = await file.arrayBuffer();
										const fileName = file.name;
										const activeFile = this.app.workspace.getActiveFile();
										const currentFolder = activeFile?.parent?.path;
										const targetPath = `${currentFolder}/files/${fileName}`;

										try {
											const folderPath = targetPath.split("/").slice(0, -1).join("/");
											if (!this.app.vault.getAbstractFileByPath(folderPath)) {
												await this.app.vault.createFolder(folderPath);
											}

											await this.app.vault.createBinary(targetPath, arrayBuffer);

											new Notice(`Imported file: ${fileName}`);
											imagePathText.setText(fileName)
											this.dataItem[field.name] = fileName
										} catch (err) {
											console.error("Error importing file:", err);
											new Notice("Failed to import file.");
										}
									};
									fileInput.click();
								});
							})
						break;
					case 'array':
						new Setting(contentEl).setName(field.label)
							.addText(text => text.onChange(val => (this.dataItem[field.name] = val)));
						break;
					case 'conditional':
						break;
					case 'markdown':
						new Setting(contentEl).setName(field.label).setDisabled(true).setDesc('Your markdown file will be created when data is submit.');
						break;
				}
			})


			new Setting(contentEl).addButton(btn => {
				btn.setButtonText('verify').onClick(async () => {
					console.log("Form data:", this.dataItem);
					// If result has data, it can save inside the data.md
					if (this.dataItem != null) {

						//generate md file if already not created
						const mdField = entitySchema.fields.find(item => item.type === 'markdown')
						console.log(mdField)
						if (mdField) {
							const file = await getMarkdownFieldFile(this.app, mdField, entitySchema, this.dataItem.id)
							if (file) this.dataItem[mdField.name] = file.path
						}


						const entityData = await getEntityData(this.app)
						if (this.isUpdate) {
							this.dataItem.updatedAt = new Date().toISOString()
							new ConfirmDialog(this.app, 'Are you sure you want to update this item?', async () => {
								const jsonString = JSON.stringify({ ...entityData, data: [...entityData.data.filter(item => item.id != this.dataItem.id), this.dataItem] }, null, 2);
								if (currentFolder)
									await updateMDFile(this.app.vault, `${currentFolder}/data.md`, jsonString)
							}, () => {
								new Notice('You canceled the edit')
							})
						} else {
							this.dataItem.createdAt = new Date().toISOString()
							this.dataItem.updatedAt = new Date().toISOString()
							const jsonString = JSON.stringify({ ...entityData, data: [...entityData.data, this.dataItem] }, null, 2);
							if (currentFolder)
								await updateMDFile(this.app.vault, `${currentFolder}/data.md`, jsonString)
						}
					}
					this.close();
					return true
					// } else {
					// 	new Notice("Fill all the fields");
					// }
				})
			})
		}
	}

	onClose() {
		// new Notice("You close before saving. Creating with default values! ");
		// const { contentEl } = this;
		// this.onSubmit(false, {
		// 	name: "Default Name",
		// 	type: "string",
		// });
		// contentEl.empty();
	}

	getOptionsFormat(options: TOptionItem[]) {
		return options.reduce<Record<string, string>>((acc, item) => {
			acc[item.title] = item.title
			return acc
		}, {})
	}

	getURL(contentEl: HTMLElement, field: TCommonField) {
		let urlPrefix = 'https://'
		let url = ''

		const updateCombined = async () => {
			const part1 = urlPrefix || "";
			const part2 = url || "";
			this.dataItem[field.name] = `${part1}${part2}`;
		};

		new Setting(contentEl)
			.setName(field.label)
			.addText(text1 => {
				text1
					.setPlaceholder("Prefix")
					.setValue(urlPrefix || "")
					.onChange(value => {
						urlPrefix = value;
						updateCombined();
					});
			})
			.addText(text2 => {
				text2
					.setPlaceholder("URL")
					.setValue(url || "")
					.onChange(value => {
						url = value;
						updateCombined();
					});
			});
	}
}



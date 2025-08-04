import { Modal, App, Setting, Notice, TFile, TAbstractFile, } from "obsidian";
import { TData, TDataItem } from "src/types/data";
import { TBaseField, TCommonField, TEntity, TFileField, TNumberField, TSelectField } from "src/types/field";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";
import { getEntityData, getEntitySchema } from "src/utils/entity-util";
import { getCurrentFolder } from "src/utils/folderName";
import { fileExists, updateMDFile } from "src/utils/markdown-manager";
import { getMarkdownFilePath } from "./create-file";

export class ModalDataForm extends Modal {
	dataItem: TDataItem
	isUpdate: boolean
	isSubmited: boolean
	entityCountID: number;
	defaultData: TDataItem | undefined
	title: string
	buttonText: string

	constructor(app: App, defaultData?: TDataItem) {
		super(app);
		this.isUpdate = defaultData ? true : false
		this.defaultData = defaultData
		this.isSubmited = false;
		this.entityCountID = 0;
		this.dataItem = defaultData ? defaultData : {
			id: '', //crypto.randomUUID()
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}

		this.title = defaultData ? `Edit ${this.dataItem.label}` : 'Create new Data'
		this.buttonText = defaultData ? `Edit data for ${this.dataItem.label}` : "Create"
	}

	async onOpen() {
		const { contentEl } = this;

		const currentFolder = await getCurrentFolder(this.app)
		const file = fileExists(this.app, `${currentFolder}/entity.md`)
		if (!file) {
			contentEl.createEl("h2", { text: "Entity Schema not found!" });
			contentEl.createEl('p', { text: "Make sure you first create an entity schema before trying to create data" })

			new Setting(contentEl)
				.addButton(btn => {
					btn.setButtonText('Ok').onClick(() => this.close())
				})
		} else {
			await this.generateID()
			const entitySchema = await getEntitySchema(this.app)

			const dialogTitle = this.isUpdate ? '' : 'Create'
			contentEl.createEl("h2", { text: `${dialogTitle} data for ${entitySchema.label}` });

			entitySchema.fields.map(async (field) => {
				switch (field.type) {
					case 'string':
						this.renderString(field, contentEl)
						break;
					case 'number':
						this.renderNumber(field, contentEl)
						break;
					case 'boolean':
						this.renderBoolean(field, contentEl)
						break;
					case 'date':
						this.renderDate(field, contentEl)
						break;
					case 'select':
						this.renderSelect(field, contentEl)
						break;
					case 'url':
						this.renderURL(field, contentEl)
						break;
					case 'file':
						this.renderFile(field, contentEl)
						break;
					case 'array':
						this.renderArray(field, contentEl)
						break;
					case 'markdown':
						this.renderMarkdown(field, contentEl)
						break;
				}
			})
			new Setting(contentEl).addButton(btn => {
				btn.setButtonText('verify').onClick(async () => {
					console.log("Form data:", this.dataItem);
					this.createData()
				})
			})
		}
	}

	async onClose() {
		if (!this.isSubmited) {
			new Notice("You close before saving. Nothing was created");

			const currentFolder = await getCurrentFolder(this.app)
			const file = fileExists(this.app, `${currentFolder}/entity.md`)
			if (file) {
				const entitySchema = await getEntitySchema(this.app)
				entitySchema.fields.map(async (field) => {
					if (field.type === 'file') {

						const fileName = this.dataItem[field.name]
						const foundFile = this.app.vault.getAbstractFileByPath(`${currentFolder}/files/${fileName}`);

						if (foundFile instanceof TFile) {
							await this.app.vault.delete(foundFile);
						}
					}
				})
			}
			const { contentEl } = this;
			contentEl.empty();
		}
	}

	private async generateID() {
		const entityData = await getEntityData(this.app);

		if (this.defaultData) {
			this.entityCountID = entityData.idCount
		} else {
			const newEntityDataIdCount = entityData.idCount + 1;
			this.entityCountID = newEntityDataIdCount;
			console.log('Entity id', newEntityDataIdCount, this.entityCountID)

			this.dataItem.id = newEntityDataIdCount.toString().padStart(3, '0');
		}
	}

	private async createData() {
		const currentFolder = await getCurrentFolder(this.app)
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

			const validate = await this.validateEntityData()
			if (validate.isValid) {
				if (!this.isUpdate) {
					const entitySchema = await getEntitySchema(this.app)
					const markdownFiles = entitySchema.fields.filter(item => item.type === 'markdown') as TFileField[]
					markdownFiles.forEach(markdownfield => {
						this.createMarkdownFile(markdownfield, entitySchema)
					});
				}


				const completeData: TData = { ...entityData, idCount: this.entityCountID, data: [...entityData.data, this.dataItem] }
				console.log(completeData)
				const jsonString = JSON.stringify(completeData, null, 2);
				if (currentFolder)
					await updateMDFile(this.app.vault, `${currentFolder}/data.md`, jsonString)
				this.isSubmited = true
				this.close()
			}
			else {
				new Notice(`Fill all the fields! ${validate.missingFields}`)
			}
		}
	}

	private async createMarkdownFile(markdownFile: TFileField, entitySchema: TEntity): Promise<TAbstractFile | null> {
		if (!markdownFile) return null

		const currentPath = await getCurrentFolder(this.app)
		const hasFolderCreated = this.app.vault.getFolderByPath(`${currentPath}/md`)
		if (!hasFolderCreated) {
			this.app.vault.createFolder(`${currentPath}/md`);
		}

		const filePath = getMarkdownFilePath(markdownFile, entitySchema, this.dataItem.id)

		await this.app.vault.create(`${currentPath}/${filePath}`, `# MD File\n`);
		const newFile = this.app.vault.getAbstractFileByPath(`${currentPath}/${filePath}`);
		await this.app.workspace.getLeaf(true).openFile(newFile as TFile);
		const file = this.app.vault.getAbstractFileByPath(`${currentPath}/${filePath}`);
		return file
	}

	private async validateEntityData() {
		const entitySchema = await getEntitySchema(this.app)
		const missingFields = [];

		for (const field of entitySchema.fields) {
			const value = this.dataItem[field.name];

			const isEmpty = value === undefined || value === null

			if (isEmpty)
				missingFields.push(field.name);
		}

		return {
			isValid: missingFields.length === 0,
			missingFields
		};
	}

	private renderString(field: TCommonField, contentEl: HTMLElement) {
		new Setting(contentEl).setName(field.label)
			.addTextArea(stringField => {
				stringField.setValue(this.dataItem[field.name] ? this.dataItem[field.name] : '')
				stringField.onChange(val => (this.dataItem[field.name] = val))
					.setPlaceholder('Type a text')
				stringField.inputEl.style.resize = 'vertical'
				stringField.inputEl.style.width = '100%'
			});
	}

	private renderNumber(field: TNumberField, contentEl: HTMLElement) {
		new Setting(contentEl).setName(field.label)
			.addText(numberField => {
				numberField.setValue(this.dataItem[field.name] ? this.dataItem[field.name] : '')
				numberField.inputEl.type = "number";
				numberField.setPlaceholder('Type a number')
				const precision = (field as TNumberField).precision;
				numberField.inputEl.step = (1 / Math.pow(10, precision)).toString();

				numberField.onChange(val => {
					const parsed = parseFloat(val);
					this.dataItem[field.name] = isNaN(parsed) ? 'undefined' : parsed.toString();
				})
			});
	}

	private renderBoolean(field: TCommonField, contentEl: HTMLElement) {
		new Setting(contentEl).setName(field.label).addToggle(booleanField => {
			const defaultBoolean = this.dataItem[field.name] ? this.dataItem[field.name] : ''
			booleanField.setValue(!!defaultBoolean)
			booleanField.onChange(val => (this.dataItem[field.name] = val.toString()))
		})
	}

	private renderDate(field: TCommonField, contentEl: HTMLElement) {
		new Setting(contentEl)
			.setName(field.label)
			.addText(dateField => {
				const date = new Date()
				const defaultDate = this.dataItem[field.name] ? this.dataItem[field.name].split("T")[0] : date.toISOString().split("T")[0]

				dateField.setValue(defaultDate)
				dateField.inputEl.type = "date";
				dateField.onChange(val => {
					dateField.setPlaceholder('Type a date')
					const isoString = new Date(val).toISOString();
					this.dataItem[field.name] = isoString;
				});
			});
	}


	private renderSelect(field: TSelectField, contentEl: HTMLElement) {
		new Setting(contentEl).setName(field.label).addDropdown(dropdown => {
			const options = field.options.reduce<Record<string, string>>((acc, item) => {
				acc[item.title] = item.title
				return acc
			}, {})

			dropdown
				.setValue(this.dataItem[field.name] ? this.dataItem[field.name] : options[Object.keys(options)[0]])
				.addOptions((options))
				.onChange(val => (this.dataItem[field.name] = val))
		})
	}

	private renderURL(field: TCommonField, contentEl: HTMLElement) {
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



	private async renderMarkdown(field: TFileField, container: HTMLElement) {
		const entitySchema = await getEntitySchema(this.app)
		const file = getMarkdownFilePath(field, entitySchema, this.dataItem.id)
		this.dataItem[field.name] = file
		new Setting(container).setName(field.label).then(setting => {
			setting.controlEl.createEl("span", {
				text: file,
				cls: "setting-item-description"
			});
		})
	}

	private renderFile(field: TFileField, container: HTMLElement) {
		// Image name = field.name + field.id.<extensão original>
		// When user select the image, the image is sent to /files folder
		// If user canceled the creation, just search for image inside the files and delete

		new Setting(container)
			.setName(field.label)
			.addButton((btn) => {
				const imagePathContainer = container.createDiv();
				console.log('field', field)
				let imageContainer: HTMLImageElement;
				const imagePathText = imagePathContainer.createSpan(this.dataItem[field.name] ? this.dataItem[field.name] : '')
				if (this.dataItem[field.name])
					imageContainer = imagePathContainer.createEl('img', { attr: { width: '100px', height: '100px', src: `files/${this.dataItem[field.name]}` } })

				btn.setButtonText("Choose File").onClick(() => {
					const fileInput = document.createElement("input");
					fileInput.type = "file";
					fileInput.accept = "*/*";

					fileInput.onchange = async () => {
						if (!fileInput.files || fileInput.files.length === 0) return;

						const file = fileInput.files[0];

						const arrayBuffer = await file.arrayBuffer();
						const currentFolder = await getCurrentFolder(this.app)
						const targetPath = `${currentFolder}/files`;
						const fileExtension = file.type.split('/')[1]
						const fileName = `${field.name}_${field.id}.${fileExtension}`


						// const file = 
						// this.app.vault.getAbstractFileByPath("images/photo.png");
						// if (file && file instanceof TFile) {
						//   const path = this.app.vault.getResourcePath(file);
						//   const img = document.createElement("img");
						//   img.src = path;
						//   containerEl.appendChild(img);
						// }

						try {
							if (!this.app.vault.getAbstractFileByPath(targetPath)) {
								await this.app.vault.createFolder(targetPath);
							}
							await this.app.vault.createBinary(`${targetPath}/${fileName}`, arrayBuffer);

							imagePathText.setText(fileName)
							if (imageContainer)
								imagePathContainer.setAttr('src', `files/${fileName}`)
							else
								imagePathContainer.createEl('img', { attr: { width: '100px', height: '100px', src: `files/${fileName}` } })
							this.dataItem[field.name] = fileName
						} catch (err) {
							new Notice("Failed to import file.");
						}
					};
					fileInput.click();
				});
			})
	}

	private renderArray(field: TBaseField, wrapper: HTMLElement) {
		new Setting(wrapper).setName(field.label).setDesc('Use comma (,) to separate itens')
			.addText(text => text.setValue(this.dataItem[field.name] ? this.dataItem[field.name] : '').onChange(val => {
				this.dataItem[field.name] = val

				const data = val.split(',')
				container.empty()
				data.map((item) => {
					container.createDiv({ cls: 'array-item', text: item })
				})
			}));

		const container = wrapper.createDiv()
	}
}



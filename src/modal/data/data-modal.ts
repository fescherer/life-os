import { Modal, App, Setting, Notice, TFile, TAbstractFile, TFolder } from "obsidian";
import { TDataItem } from "src/types/data";
import { TBaseField, TCommonField, TMarkdownField, TNumberField, TSelectField } from "src/types/field";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";
import { getEntityData, getEntitySchema } from "src/utils/entity-util";
import { getCurrentFolder } from "src/utils/folderName";
import { fileExists, updateMDFile } from "src/utils/markdown-manager";
import { getMarkdownFilePath } from "./get-markdown-path";

export class ModalDataForm extends Modal {
	dataItem: TDataItem
	isUpdate: boolean
	isSubmited: boolean
	defaultData: TDataItem | undefined

	constructor(app: App, defaultData?: TDataItem) {
		super(app);
		this.isUpdate = defaultData ? true : false
		this.defaultData = defaultData
		this.isSubmited = false;
		this.dataItem = defaultData ? defaultData : {
			id: crypto.randomUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	}

	async onOpen() {
		const { contentEl } = this;

		const currentFolder = await getCurrentFolder(this.app)
		console.log(currentFolder)
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

	onClose() {
		if (!this.isSubmited) {
			new Notice("You close before saving. Nothing was created");
			const { contentEl } = this;
			contentEl.empty();
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
				this.createMarkdownFile()
				this.sendImages()
				const jsonString = JSON.stringify({ ...entityData, data: [...entityData.data, this.dataItem] }, null, 2);
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



	private async createMarkdownFile(): Promise<TAbstractFile | null> {
		const entitySchema = await getEntitySchema(this.app)
		const hasMarkdownFile = entitySchema.fields.find(item => item.type === 'markdown')
		if (!hasMarkdownFile) return null

		const filePath = getMarkdownFilePath(hasMarkdownFile, entitySchema, this.dataItem.id)
		console.log(filePath)
		const currentPath = await getCurrentFolder(this.app)


		const hasFolderCreated = this.app.vault.getFolderByPath(`${currentPath}/md`)
		if (!hasFolderCreated) {
			this.app.vault.createFolder(`${currentPath}/md`);
		}

		await this.app.vault.create(`${currentPath}/${filePath}`, `# MD File\n`);
		console.log(`${currentPath}/${filePath}`)
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
				stringField.setValue(this.defaultData ? this.defaultData[field.name] : '')
				stringField.onChange(val => (this.dataItem[field.name] = val))
					.setPlaceholder('Type a text')
				stringField.inputEl.style.resize = 'vertical'
				stringField.inputEl.style.width = '100%'
			});
	}

	private renderNumber(field: TNumberField, contentEl: HTMLElement) {
		new Setting(contentEl).setName(field.label)
			.addText(numberField => {
				numberField.setValue(this.defaultData ? this.defaultData[field.name] : '')
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
			const defaultBoolean = this.defaultData ? this.defaultData[field.name] : ''
			booleanField.setValue(!!defaultBoolean)
			booleanField.onChange(val => (this.dataItem[field.name] = val.toString()))
		})
	}

	private renderDate(field: TCommonField, contentEl: HTMLElement) {
		new Setting(contentEl)
			.setName(field.label)
			.addText(dateField => {
				const date = new Date()
				const defaultDate = this.defaultData ? this.defaultData[field.name].split("T")[0] : date.toISOString().split("T")[0]

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
				.setValue(this.defaultData ? this.defaultData[field.name] : options[Object.keys(options)[0]])
				.addOptions((options))
				.onChange(val => (this.dataItem[field.name] = val))
		})
	}

	private renderURL(field: TCommonField, contentEl: HTMLElement) {
		const defaultURL = this.defaultData ? this.defaultData[field.name].split('|') : ''

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



	private async renderMarkdown(field: TMarkdownField, container: HTMLElement) {
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

	private renderFile(field: TCommonField, container: HTMLElement) {
		new Setting(container)
			.setName(field.label)
			.addButton((btn) => {
				const imagePathText = container.createDiv();
				imagePathText.setText(this.defaultData ? this.defaultData[field.name] : '')

				btn.setButtonText("Choose File").onClick(() => {
					const fileInput = document.createElement("input");
					fileInput.type = "file";
					fileInput.accept = "*/*";

					fileInput.onchange = async () => {
						if (!fileInput.files || fileInput.files.length === 0) return;

						const file = fileInput.files[0];

						const arrayBuffer = await file.arrayBuffer();
						const fileName = file.name;
						const currentFolder = await getCurrentFolder(this.app)
						const targetPath = `${currentFolder}/temp`;

						try {
							if (!this.app.vault.getAbstractFileByPath(targetPath)) {
								await this.app.vault.createFolder(targetPath);
							}
							await this.app.vault.createBinary(`${targetPath}/${fileName}`, arrayBuffer);

							imagePathText.setText(fileName)
							this.dataItem[field.name] = fileName
						} catch (err) {
							new Notice("Failed to import file.");
						}
					};
					fileInput.click();
				});
			})
	}

	private async sendImages() {
		const entitySchema = await getEntitySchema(this.app)
		const hasTempFile = entitySchema.fields.find(item => item.type === 'file')
		if (!hasTempFile) return null

		const currentFolder = await getCurrentFolder(this.app)
		const tempPath = `${currentFolder}/temp`;
		const targetPath = `${currentFolder}/files`;

		const vault = this.app.vault;

		// Get source folder
		const source = vault.getAbstractFileByPath(tempPath);
		if (!(source instanceof TFolder)) {
			console.warn(`Source folder "${tempPath}" not found.`);
			return;
		}

		// Create target folder if it doesn't exist
		let target = vault.getAbstractFileByPath(targetPath);
		if (!(target instanceof TFolder)) {
			await vault.createFolder(targetPath);
			target = vault.getAbstractFileByPath(targetPath);
		}

		// Move each file inside source folder (not subfolders unless recursive)
		for (const child of source.children) {
			if (child instanceof TFile) {
				const newPath = `${targetPath}/${child.name}`;
				await vault.rename(child, newPath);
			}
		}
	}

	private renderArray(field: TBaseField, wrapper: HTMLElement) {
		new Setting(wrapper).setName(field.label).setDesc('Use comma (,) to separate itens')
			.addText(text => text.setValue(this.defaultData ? this.defaultData[field.name] : '').onChange(val => {
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



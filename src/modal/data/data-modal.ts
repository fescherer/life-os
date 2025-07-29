import { Modal, App, Setting, Notice, TFile, TAbstractFile } from "obsidian";
import { TDataItem } from "src/types/data";
import { TBaseField, TCommonField, TEntity, TMarkdownField, TNumberField, TSelectField } from "src/types/field";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";
import { getEntityData, getEntitySchema } from "src/utils/entity-util";
import { getCurrentFolder } from "src/utils/folderName";
import { fileExists, updateMDFile } from "src/utils/markdown-manager";

export class ModalDataForm extends Modal {
	dataItem: TDataItem
	isUpdate: boolean
	isSubmited: boolean

	constructor(app: App, defaultData?: TDataItem) {
		super(app);
		this.isUpdate = defaultData ? true : false
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
						new Setting(contentEl).setName(field.label)
							.addTextArea(text => {
								text.onChange(val => (this.dataItem[field.name] = val))
									.setPlaceholder('Type a text')
								text.inputEl.style.resize = 'vertical'
								text.inputEl.style.width = '100%'
							});
						break;
					case 'number':
						new Setting(contentEl).setName(field.label)
							.addText(text => {
								text.inputEl.type = "number";
								text.setPlaceholder('Type a number')
								const precision = (field as TNumberField).precision;
								text.inputEl.step = (1 / Math.pow(10, precision)).toString();

								text.onChange(val => {
									const parsed = parseFloat(val);
									this.dataItem[field.name] = isNaN(parsed) ? undefined : parsed;
								})
							});
						break;
					case 'boolean':
						new Setting(contentEl).setName(field.label).addToggle(c => c.onChange(val => (this.dataItem[field.name] = val)))
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
						this.renderArray(field, entitySchema, contentEl)
						break;
					case 'markdown':
						this.renderMarkdown(field, entitySchema, contentEl)
						break;
				}
			})
		}

		new Setting(contentEl).addButton(btn => {
			btn.setButtonText('verify').onClick(async () => {
				console.log("Form data:", this.dataItem);
				this.createData()
			})
		})
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
			if (!this.verifyData()) {
				this.createMarkdownFile()
				const jsonString = JSON.stringify({ ...entityData, data: [...entityData.data, this.dataItem] }, null, 2);
				if (currentFolder)
					await updateMDFile(this.app.vault, `${currentFolder}/data.md`, jsonString)
			}
			else {
				new Notice("Fill all the fields!")
			}
		}
	}

	// Verificar isso aqi
	private async verifyData() {
		const entitySchema = await getEntitySchema(this.app)

		const dataKeys = Object.keys(entitySchema.fields)
		return entitySchema.fields.find(field => {
			dataKeys.find(key =>
				key === field.name && this.dataItem[key] === undefined || this.dataItem[key] === null
			)
		})
	}

	private renderDate(field: TCommonField, contentEl: HTMLElement) {
		new Setting(contentEl)
			.setName(field.label)
			.addText(text => {
				text.inputEl.type = "date";
				text.onChange(val => {
					text.setPlaceholder('Type a date')
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
				.addOptions((options))
				.onChange(val => (this.dataItem[field.name] = val))
		})
	}

	private renderURL(field: TCommonField, contentEl: HTMLElement) {
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

	private getMarkdownFilePath(field: TMarkdownField, entitySchema: TEntity): string {
		let prefix = ''
		if (field.prefixType == 'field') {
			const chosenField = entitySchema.fields.find(item => item.name == field.prefix)
			prefix = chosenField?.name + '-'
		} else if (field.prefixType == 'text') {
			prefix = field.prefix + '-'
		} else {
			prefix = ''
		}

		return `md/${prefix}${entitySchema.entity}-${this.dataItem.id}.md`;
	}

	private async createMarkdownFile(): Promise<TAbstractFile | null> {
		const entitySchema = await getEntitySchema(this.app)
		const hasMarkdownFile = entitySchema.fields.find(item => item.type === 'markdown')
		if (!hasMarkdownFile) return null

		const filePath = this.getMarkdownFilePath(hasMarkdownFile, entitySchema)

		await this.app.vault.create(filePath, `# MD File\n`);
		const newFile = this.app.vault.getAbstractFileByPath(filePath);
		await this.app.workspace.getLeaf(true).openFile(newFile as TFile);
		const file = this.app.vault.getAbstractFileByPath(filePath);
		return file
	}

	private renderMarkdown(field: TMarkdownField, entitySchema: TEntity, container: HTMLElement) {
		const file = this.getMarkdownFilePath(field, entitySchema)
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
				btn.setButtonText("Choose File").onClick(() => {
					const fileInput = document.createElement("input");
					fileInput.type = "file";
					fileInput.accept = "*/*"; // You can limit to specific types, e.g., ".pdf" or "image/*"

					fileInput.onchange = async () => {
						if (!fileInput.files || fileInput.files.length === 0) return;

						const file = fileInput.files[0];

						const arrayBuffer = await file.arrayBuffer();
						const fileName = file.name;
						const currentFolder = await getCurrentFolder(this.app)
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
	}

	private renderArray(field: TBaseField, entitySchema: TEntity, wrapper: HTMLElement) {
		//TODO add badges each click or just leave as a text field string
		const container = wrapper.createDiv()
		new Setting(wrapper).setName(field.label)
			.addText(text => text.onChange(val => {
				this.dataItem[field.name] = val
				renderFieldArray()
			}));

		renderFieldArray()

		function renderFieldArray() {
			container.empty()
			container.createSpan('dasdasdasd')
		}
	}
}



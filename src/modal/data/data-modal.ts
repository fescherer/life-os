import { Modal, App, Setting, Notice, TFile } from "obsidian";
import { TDataItem } from "src/types/data";
import { TBaseField, TCommonField, TNumberField, TSelectField } from "src/types/field";
import { getEntitySchema } from "src/utils/entity-util";
import { getCurrentFolder } from "src/utils/folderName";
import { fileExists } from "src/utils/markdown-manager";
import { generateID } from "./generate-id";
import { RenderData } from "./render/_render";

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
			name: '',
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
			await generateID(this.app, this.dataItem, this.entityCountID, this.defaultData)
			RenderData(this.app, contentEl, this.dataItem, this.entityCountID, this.isSubmited, this.defaultData)
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



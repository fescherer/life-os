import { Modal, App, Setting, Notice, setIcon } from "obsidian";
import { slugify } from "../../utils/slugify";
import { TEntity, TField, TMarkdownField, TNumberField, TPrefixField, TSelectField, TTypeField } from "src/types/field";
import { createBlankField } from "./createBlankField";

export class ModalForm extends Modal {
	onSubmit: (isValid: boolean, result: TEntity | null) => void;
	result: TEntity
	isSubmited: boolean
	fields: Array<TField> = []

	constructor(app: App, onSubmit: (isValid: boolean, result: TEntity) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.isSubmited = false;
		this.result = {
			entity: '',
			label: '',
			fields: []
		}
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Create new Entity" });

		new Setting(contentEl)
			.setName("Name")
			.addText(text => text.onChange(val => (this.result.label = val)));

		new Setting(contentEl)
			.addButton(btn =>
				btn.setButtonText("Add Field").setCta().onClick(() => {
					this.createNewField(wrapper)
				})
			);

		const wrapper = contentEl.createDiv();

		new Setting(contentEl)
			.addButton(btn =>
				btn.setButtonText("Create").setCta().onClick(() => {
					this.createSchema()
				})
			);
	}

	onClose() {
		if (!this.isSubmited) {
			new Notice("You close before saving. Nothing was created");
			const { contentEl } = this;
			this.onSubmit(false, null);
			contentEl.empty();
		}
	}

	private createNewField(wrapper: HTMLElement) {
		const typeContainer = wrapper.createDiv({ cls: "field-group-wrapper" });
		const deleteBtn = typeContainer.createDiv({ cls: "delete-icon" });
		setIcon(deleteBtn, "trash");

		const newField = createBlankField('string')
		this.fields.push(newField)

		deleteBtn.onclick = () => {
			this.fields.remove(newField)
			typeContainer.remove()
		};
		new Setting(typeContainer)
			.setName("Field Name")
			.addText(text => text.onChange(val => {
				newField.label = val
				newField.name = slugify(val)
			}))

		new Setting(typeContainer).setName("Field Type")
			.addDropdown(drop =>
				drop.addOptions({
					"string": "String",
					"number": "Number",
					"boolean": "Boolean",
					"date": "Date",
					"select": "Select",
					"multiselect": "Multiselect",
					"url": "Url",
					"file": "File",
					"array": "Array",
					"markdown": "Markdown"
				}).onChange((newType: TTypeField) => {
					newField.type = newType
					console.log('this.fields', this.fields)

					switch (newField.type) {
						case 'select':
							this.renderSelect(newField, typeContainer)
							break
						case 'number':
							this.renderNumber(newField, typeContainer)
							break
						case 'markdown':
							this.renderMarkdown(newField, typeContainer)
							break
						default:
							break
					}
				})
			);
	}

	private async createSchema() {
		const completeData = {
			...this.result,
			entity: slugify(this.result.label || ''),
			fields: this.fields
		}

		const validate = await this.validateEntitySchema(completeData)
		if (validate.isValid) {
			this.isSubmited = true
			this.onSubmit(true, completeData);
			this.close();
		} else {
			if (this.fields.length <= 0) new Notice("Add at least one field")
			else
				new Notice(`Fill all the fields! ${validate.missingFields}`)
		}
	}

	private async validateEntitySchema(entity: TEntity) {
		if (!!!entity || !entity.entity || !entity.label) return {
			isValid: false,
			missingFields: ['entity.name']
		}
		const missingFields = [];

		for (const field of entity.fields) {
			if (!this.isFieldValid(field))
				missingFields.push(field.name);
		}

		return {
			isValid: missingFields.length === 0,
			missingFields
		};
	}

	private isFieldValid(field: TField): boolean {
		if (!field.name || !field.label) return false;

		switch (field.type) {
			case 'string':
			case 'boolean':
			case 'date':
			case 'url':
			case 'file':
			case 'array':
				return true;

			case 'number':
				return typeof field.precision === 'number';

			case 'select':
				return Array.isArray(field.options) && field.options.length > 0;

			case 'markdown':
				return !!field.prefixType && field.prefix !== undefined && field.prefix !== null

			default:
				return false;
		}
	}


	private renderSelect(field: TSelectField, container: HTMLDivElement,) {
		field.options = []

		const optionsContainer = container.createDiv();
		new Setting(container).addButton((btn) => {
			let countOptions = 0

			btn.setIcon('plus').onClick(() => {
				const optionContainer = optionsContainer.createDiv();
				countOptions += 1

				const newOption = {
					id: countOptions.toString(),
					title: ''
				}
				field.options.push(newOption)
				new Setting(optionContainer).setName("Option name")
					.addText(text => text.onChange(val => (newOption.title = val)))
					.addButton((btn) => {
						btn.setIcon('trash').onClick(() => {
							field.options.map(item => item.id === newOption.id && field.options.remove(item))
							optionContainer.remove()
						})
					});
			})
		})
	}

	private renderNumber(field: TNumberField, container: HTMLElement) {
		field.precision = 0
		new Setting(container)
			.setName("Decimal dot")
			.addText(text => {
				text.inputEl.type = "number";
				text.onChange(val => {
					try {
						field.precision = parseInt(val);
					} catch {
						new Notice('Error Ocurred')
					}
				})
			});
	}

	private renderMarkdown(newField: TMarkdownField, wrapperContainer: HTMLDivElement) {
		const wrapper = wrapperContainer.createDiv({ cls: 'flex-container' })
		newField.prefixType = 'no'
		newField.prefix = ''

		new Setting(wrapper)
			.setName("Has a prefix?").addExtraButton(cb => {

				cb.setIcon("rotate-ccw")
					.setTooltip("Update Fields")
					.onClick(() => {
						container.empty()
						generateBaseOnDropdown(this.fields, container, newField)
					})
			})

		const container = wrapper.createDiv()
		function generateBaseOnDropdown(fields: Array<TField>, container: HTMLDivElement, newField: TMarkdownField) {
			const prefixContainer = container.createDiv({ cls: 'flex-container' })
			const hasPrefixSetting = new Setting(prefixContainer)
			const mdPrefixSettingContainer = prefixContainer.createDiv()


			hasPrefixSetting.addDropdown(drop =>
				drop
					.addOption("no", "No")
					.addOption("field", "Field")
					.addOption("text", "Text")
					.onChange((prefixType: TPrefixField) => {
						mdPrefixSettingContainer.empty()
						newField.prefixType = prefixType
						newField.prefix = ''
						const mdPrefixSetting = new Setting(mdPrefixSettingContainer)
						if (prefixType == 'text') mdPrefixSetting.addText(text => text.onChange((val) => newField.prefix = val))
						else if (prefixType == 'field') {
							const fieldsData = Object.fromEntries(fields.map(({ label, name }) => [label, name]))
							newField.prefix = Object.keys(fieldsData)[0]
							mdPrefixSetting.addDropdown(fieldDrop => fieldDrop.addOptions(fieldsData).onChange(val => newField.prefix = val))
						}
						else newField.prefix = ''
					})
			)
		}
		generateBaseOnDropdown(this.fields, container, newField)
	}
}



import { Modal, App, Setting, Notice, setIcon } from "obsidian";
import { slugify } from "../../utils/slugify";
import { TEntity, TField, TFileField, TNumberField, TPrefixField, TSelectField, TTypeField } from "src/types/field";

export class ModalForm extends Modal {
	onSubmit: (isValid: boolean, result: TEntity | null) => void;
	entity: TEntity
	isSubmited: boolean
	title: string
	buttonText: string

	constructor(app: App, onSubmit: (isValid: boolean, result: TEntity) => void, defaultData?: TEntity) {
		super(app);
		this.onSubmit = onSubmit;
		this.isSubmited = false;
		this.entity = defaultData ? defaultData : {
			entity: '',
			label: '',
			fields: []
		}
		this.title = defaultData ? `Edit ${this.entity.label}` : 'Create new Entity'
		this.buttonText = defaultData ? `Edit ${this.entity.label}` : "Create"
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: this.title });

		new Setting(contentEl)
			.setName("Name")
			.addText(text => {
				text.setValue(this.entity.label)
				text.onChange(val => (this.entity.label = val))
			});


		new Setting(contentEl)
			.addButton(btn =>
				btn.setButtonText("Add Field").setCta().onClick(() => {
					const newField = {
						id: this.entity.fields.length,
						name: '',
						label: '',
						type: 'string',
					} as Extract<TField, { type: TTypeField }>

					this.entity.fields.push(newField)

					this.renderField(wrapper, newField)
				})
			);

		const wrapper = contentEl.createDiv();

		this.entity.fields.map(field => this.renderField(wrapper, field))

		new Setting(contentEl)
			.addButton(btn =>
				btn.setButtonText(this.buttonText).setCta().onClick(() => {
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

	private changeFieldOrder(wrapper: HTMLElement, direction: 'up' | 'down', changePositionField: TField) {
		wrapper.empty()
		const index = this.entity.fields.findIndex(field => field.id === changePositionField.id);

		if (index === -1) return;

		if (direction === 'up' && index > 0) {
			[this.entity.fields[index - 1], this.entity.fields[index]] = [this.entity.fields[index], this.entity.fields[index - 1]];
		} else if (direction === 'down' && index < this.entity.fields.length - 1) {
			[this.entity.fields[index + 1], this.entity.fields[index]] = [this.entity.fields[index], this.entity.fields[index + 1]];
		}

		this.entity.fields.forEach((field, idx) => {
			field.id = idx;
			this.renderField(wrapper, field)
		});
	}

	private renderField(wrapper: HTMLElement, newField: TField) {
		const fieldWrapperContainer = wrapper.createDiv({ cls: 'flex' });

		const fieldOrderContainer = fieldWrapperContainer.createDiv({ cls: 'my-vertical-button-wrapper' })
		const btnUp = fieldOrderContainer.createEl("button");
		setIcon(btnUp, 'chevron-up')
		btnUp.onclick = () => this.changeFieldOrder(wrapper, 'up', newField);

		const btnDown = fieldOrderContainer.createEl("button");
		setIcon(btnDown, 'chevron-down')
		btnDown.onclick = () => this.changeFieldOrder(wrapper, 'down', newField);

		const typeContainer = fieldWrapperContainer.createDiv({ cls: "field-group-wrapper" });
		const deleteBtn = typeContainer.createDiv({ cls: "delete-icon" });
		setIcon(deleteBtn, "trash");

		deleteBtn.onclick = () => {
			this.entity.fields.remove(newField)
			typeContainer.remove()
		};


		new Setting(typeContainer)
			.setName("Field Name")
			.addText(text => {
				text.setValue(newField ? newField.label : '')
				text.onChange(val => {
					newField.label = val
					newField.name = slugify(val)
				})
			})

		new Setting(typeContainer).setName("Field Type")
			.addDropdown(drop =>
				drop.addOptions({
					"string": "String",
					"number": "Number",
					"boolean": "Boolean",
					"date": "Date",
					"select": "Select",
					"url": "Url",
					"file": "File",
					"array": "Array",
					"markdown": "Markdown"
				}).setValue(newField ? newField.type : '')
					.onChange((newType: TTypeField) => {
						newField.type = newType
						console.log('this.entity.fields', this.entity.fields)

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
		const completeData: TEntity = {
			...this.entity,
			entity: slugify(this.entity.label || ''),
			fields: this.entity.fields
		}

		const validate = await this.validateEntitySchema(completeData)
		if (validate.isValid) {
			this.isSubmited = true
			this.onSubmit(true, completeData);
			this.close();
		} else {
			if (this.entity.fields.length <= 0) new Notice("Add at least one field")
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


	private renderSelect(field: TSelectField, container: HTMLDivElement) {
		if (!field.options) field.options = []

		const optionsContainer = container.createDiv();
		new Setting(container).addButton((btn) => {
			if (field.options.length > 0) {
				field.options.map(option => {
					const optionContainer = optionsContainer.createDiv();
					new Setting(optionContainer).setName("Option name")
						.addText(text => text.onChange(val => (option.title = val)))
						.addButton((btn) => {
							btn.setIcon('trash').onClick(() => {
								field.options.map(item => item.id === option.id && field.options.remove(item))
								optionContainer.remove()
							})
						});
				})
			}
			let countOptions = field.options.length ? field.options.length : 0

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
		if (!field.precision) field.precision = 0

		new Setting(container)
			.setName("Decimal dot")
			.addText(text => {
				text.inputEl.type = "number";
				text.setValue(field ? field.precision.toString() : '0')
				text.onChange(val => {
					try {
						field.precision = parseInt(val);
					} catch {
						new Notice('Error Ocurred')
					}
				})
			});
	}

	private renderMarkdown(newField: TFileField, wrapperContainer: HTMLDivElement) {
		const wrapper = wrapperContainer.createDiv({ cls: 'flex-container' })
		newField.prefixType = 'no'
		newField.prefix = ''

		new Setting(wrapper)
			.setName("Has a prefix?").addExtraButton(cb => {

				cb.setIcon("rotate-ccw")
					.setTooltip("Update Fields")
					.onClick(() => {
						container.empty()
						generateBaseOnDropdown(this.entity.fields, container, newField)
					})
			})

		const container = wrapper.createDiv()
		function generateBaseOnDropdown(fields: Array<TField>, container: HTMLDivElement, newField: TFileField) {
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
		generateBaseOnDropdown(this.entity.fields, container, newField)
	}
}



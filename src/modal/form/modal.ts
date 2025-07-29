import { Modal, App, Setting, Notice, setIcon } from "obsidian";
import { slugify } from "../../utils/slugify";
import { TEntity, TField, TMarkdownField, TPrefixField, TSelectField, TTypeField } from "src/types/field";
import { createBlankField } from "./createBlankField";

export class ModalForm extends Modal {
	onSubmit: (isValid: boolean, result: Record<string, unknown>) => void;
	result: TEntity
	isSubmited: boolean
	fields: Array<TField> = []

	constructor(app: App, onSubmit: (isValid: boolean, result: Record<string, unknown>) => void) {
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
				btn
					.setButtonText("Add Field")
					.setCta()
					.onClick(() => {
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
								drop
									.addOption("string", "String")
									.addOption("number", "Number")
									.addOption("boolean", "Boolean")
									.addOption("date", "Date")
									.addOption("select", "Select")
									.addOption("multiselect", "Multiselect")
									.addOption("url", "Url")
									.addOption("file", "File")
									.addOption("array", "Array")
									.addOption("markdown", "Markdown")
									.onChange((newType: TTypeField) => {
										newField.type = newType
										console.log('this.fields', this.fields)

										switch (newField.type) {
											case 'select':
												newField.options = []
												this.addOption(typeContainer, newField)
												break
											case 'number':
												newField.precision = 0
												new Setting(typeContainer)
													.setName("Decimal dot")
													.addText(text => {
														text.inputEl.type = "number";
														text.onChange(val => {
															try {
																newField.precision = parseInt(val);
															} catch {
																new Notice('Error Ocurred')
															}
														})
													});
												break
											case 'markdown':
												this.generateMarkdownFN(newField, typeContainer)
												break
											default:
												break
										}
									}
									)
							);



					})
			);
		const wrapper = contentEl.createDiv();
		new Setting(contentEl)
			.addButton(btn =>
				btn
					.setButtonText("Create")
					.setCta()
					.onClick(() => {
						const completeData = {
							...this.result,
							entity: slugify(this.result.label || ''),
							fields: this.fields
						}
						if (this.formIsFilled(completeData)) {
							this.isSubmited = true
							this.onSubmit(true, completeData);
							this.close();
						} else {
							if (this.fields.length <= 0) new Notice("Add at least one field")
							else
								new Notice("Fill all the fields");
						}
					})
			);
	}

	onClose() {
		if (!this.isSubmited) {
			new Notice("You close before saving. Nothing was created");
			const { contentEl } = this;
			this.onSubmit(false, {});
			contentEl.empty();
		}
	}

	isFieldValid(field: TField): boolean {
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

	formIsFilled(entity: TEntity): boolean {
		console.log('this.result: ', entity)
		return this.result && !!this.result.label && entity.fields.length > 0 && entity.fields.every(this.isFieldValid);
	}

	addOption(container: HTMLDivElement, field: TSelectField) {
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

	generateMarkdownFN(newField: TMarkdownField, wrapperContainer: HTMLDivElement) {
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
							console.log('aaaaaaaa', fieldsData)
							mdPrefixSetting.addDropdown(fieldDrop => fieldDrop.addOptions(fieldsData).onChange(val => newField.prefix = val))
						}
						else newField.prefix = ''
					})
			)
		}
		generateBaseOnDropdown(this.fields, container, newField)
	}
}



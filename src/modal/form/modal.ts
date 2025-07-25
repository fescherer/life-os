import { Modal, App, Setting, Notice, setIcon } from "obsidian";
import { slugify } from "../../utils/slugify";
import { TEntity, TField, TMultiSelectField, TPrefixField, TSelectField, TTypeField } from "src/types/field";
import { createBlankField } from "./createBlankField";

export class ModalForm extends Modal {
	onSubmit: (isValid: boolean, result: Record<string, unknown>) => void;
	result: TEntity
	isValid: boolean
	fields: Array<TField> = []

	constructor(app: App, onSubmit: (isValid: boolean, result: Record<string, unknown>) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.result = {
			entity: '',
			label: '',
			fields: []
		}
		this.isValid = false
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
						const deleteBtn = typeContainer.createEl("div", { cls: "delete-icon" });
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
									.addOption("conditional", "Conditional")
									.addOption("markdown", "Markdown")
									.onChange((newType: TTypeField) => {
										// giveTypeField(newType, container, newField)
										// const newField = createNewField(newType, newField.label);

										newField.type = newType
										console.log(this.fields)

										switch (newField.type) {
											case 'select':
											case 'multiselect':
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
												// This has the same challange of the conditional- The fields are base on other fields, which means that we have to update this dropdown on every other change of the other fields
												// Add a dropdown that has the text: HasPrefix? The options - No, Text, other field
												// Depending on the dropdown value, will open another field
												// TODO Add a way to get all the current fields
												const markdownSetting = new Setting(typeContainer)
													.setName("Has a prefix?")
													.addDropdown(drop =>
														drop
															.addOption("", "No")
															.addOption("field", "Field")
															.addOption("text", "Text")
															.onChange((prefixType: TPrefixField) => {
																newField.prefixType = prefixType
																const allFields = {
																	fieldA: '',
																	fieldB: ''
																}
																if (prefixType == 'text') markdownSetting.addText(text => text.onChange((val) => newField.prefix = val))
																else if (prefixType == 'field') markdownSetting.addDropdown(fieldDrop => fieldDrop.addOptions(allFields).onChange(val => newField.prefix = val))
																else newField.prefix = ''
															})
													)


												break;
											case 'conditional':
												// TODO Add a way to get all the current fields
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
						if (this.formIsFilled()) {
							this.onSubmit(true, {
								...this.result,
								entity: slugify(this.result.label || ''),
								fields: this.fields
							});
							this.close();
							return true
						} else {
							new Notice("Fill all the fields");
						}
					})
			);
	}

	onClose() {
		// TODO Verificar se está funcionando corretamente o sistema de fechar
		// new Notice("You close before saving. Creating with default values! ");
		// const { contentEl } = this;
		// this.onSubmit(false, {
		// 	name: "Default Name",
		// 	type: "string",
		// });
		// contentEl.empty();
	}

	formIsFilled(): boolean {
		console.log(this.result)
		return this.result && !!this.result.label;
	}

	addOption(container: HTMLDivElement, field: TSelectField | TMultiSelectField) {
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
}



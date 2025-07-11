import { Modal, App, Setting, Notice, setIcon } from "obsidian";
import { slugify } from "../../utils/slugify";
import { TField, TMultiSelectField, TSelectField, TTypeField } from "src/types/field";
import { createNewField } from "./createNewField";

export class ModalForm extends Modal {
	onSubmit: (isValid: boolean, result: Record<string, unknown>) => void;
	result: Record<string, any>
	isValid: boolean
	fields: Array<TField> = []

	constructor(app: App, onSubmit: (isValid: boolean, result: Record<string, unknown>) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.result = {
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

						// const newField = createNewField('string', '');
						const newField: TField = { name: '', label: '', type: 'string' };
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
								entity: slugify(this.result.label || ''),
								...this.result,
								fields: this.fields
							});
							// this.close();
							return true
						} else {
							new Notice("Fill all the fields");
						}
					})
			);
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

	formIsFilled(): boolean {
		console.log(this.result)
		return this.result && this.result.label;
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



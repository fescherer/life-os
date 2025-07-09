import { Modal, App, Setting, Notice, setIcon } from "obsidian";
import { slugify } from "../../utils/slugify";
import { TField, TTypeField } from "src/types/field";
import { giveTypeField } from "./type-field";
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
						const container = wrapper.createDiv({ cls: "field-group-wrapper" });
						const deleteBtn = container.createEl("div", { cls: "delete-icon" });
						setIcon(deleteBtn, "trash");

						let newField = createNewField('string', '');
						this.fields.push(newField)

						deleteBtn.onclick = () => {
							this.fields.remove(newField)
							container.remove()
						};
						new Setting(container)
							.setName("Field Name")
							.addText(text => text.onChange(val => {
								newField.label = val
								newField.name = slugify(val)
							}))
						new Setting(container).setName("Field Type")
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
									.setValue('string')
									.onChange((val: TTypeField) => {
										newField = createNewField(val, newField.label);
										giveTypeField(val, container, newField)
									})
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
							this.close();
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
}



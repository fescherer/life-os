import { Modal, App, Setting, Notice } from "obsidian";
import { slugify } from "../../utils/slugify";

export class ModalForm extends Modal {
	onSubmit: (result: Record<string, unknown>) => void;
	result: Record<string, any>

	constructor(app: App, onSubmit: (result: Record<string, unknown>) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.result = {
			name: '',
			label: '',
			type: 'string'
		}
	}



	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Create new Entity" });


		let decimalSetting: Setting | null = null;

		new Setting(contentEl)
			.setName("Name")
			.addText(text => text.onChange(val => (this.result.label = val)));

		new Setting(contentEl)
			.setName("Type")
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
					.onChange(val => {
						this.result.type = val;
						if (val === 'number' && !decimalSetting) {
							decimalSetting = new Setting(dynamicContainer)
								.setName("Decimal dot")
								.addText(text => {
									text.inputEl.type = "number";
									text.onChange(val => (this.result.decimal = val))
								});
						} else {
							if (decimalSetting) {
								decimalSetting.settingEl.remove();
								decimalSetting = null;
							}
						}
					})
			);

		const dynamicContainer = contentEl.createDiv();
		new Setting(contentEl)
			.addButton(btn =>
				btn
					.setButtonText("Create")
					.setCta()
					.onClick(() => {
						if (this.formIsFilled()) {
							this.close();
							this.onSubmit({
								entity: slugify(this.result.label || ''),
								...this.result
							});
						} else {
							new Notice("Fill all the fields");
						}
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		new Notice("You close before saving. Creating with default values! ");
		this.onSubmit({
			name: "Default Name",
			type: "string",
		});
		contentEl.empty();
	}

	formIsFilled(): boolean {
		return this.result && this.result.name && this.result.type;
	}
}



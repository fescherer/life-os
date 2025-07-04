import { Modal, App, Setting, Notice } from "obsidian";
import { slugify } from "./slugify";

export class JsonFormModal extends Modal {
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
		const dynamicContainer = contentEl.createDiv();

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
					.setValue('string')
					.onChange(val => {
						this.result.type = val;
						if (val === 'number' && !decimalSetting) {
							decimalSetting = new Setting(dynamicContainer)
								.setName("decimal")
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



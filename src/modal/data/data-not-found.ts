import { Modal, App, Setting } from "obsidian";


export class ModalDataNotFoundForm extends Modal {
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this

		contentEl.createEl("h2", { text: "Entity Schema not found!" });
		contentEl.createEl('p', { text: "Make sure you first create an entity schema before trying to create data" })

		new Setting(contentEl)
			.addButton(btn => {
				btn.setButtonText('Ok').onClick(() => this.close())
			})
	}
}



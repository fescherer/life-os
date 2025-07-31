import { App, Modal, Setting } from "obsidian";

export class ConfirmDialog extends Modal {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;

	constructor(app: App, message: string, onConfirm: () => void, onCancel: () => void) {
		super(app);
		this.message = message;
		this.onConfirm = onConfirm;
		this.onCancel = onCancel;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("p", { text: this.message });

		new Setting(contentEl)
			.addButton(btn =>
				btn.setButtonText("OK")
					.setCta()
					.onClick(() => {
						this.close();
						this.onConfirm();
					})
			)
			.addButton(btn =>
				btn.setButtonText("Cancel")
					.onClick(() => {
						this.close();
						this.onCancel();
					})
			);
	}

	onClose() {
		this.contentEl.empty();
	}
}

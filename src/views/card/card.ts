import { App, Notice, setIcon } from "obsidian";
import { TDataItem } from "src/types/data";
import { TEntity } from "src/types/field";
import { getCurrentFolder } from "src/utils/folderName";
import { getFileByPath } from "src/utils/markdown-manager";

export class Card {
	private app: App
	private data: TDataItem
	private wrapperContainer: HTMLElement
	private entitySchema: TEntity

	constructor(app: App, data: TDataItem, wrapperContainer: HTMLElement, entitySchema: TEntity) {
		if (!data) new Notice('Data not found for this card')
		this.app = app
		this.data = data
		this.wrapperContainer = wrapperContainer
		this.entitySchema = entitySchema
	}

	public getCardData() {
		return this.data
	}

	public async render() {
		const cardContainer = this.wrapperContainer.createDiv({ cls: "card" });
		cardContainer.dataset.cardId = `card-${this.data.id}`;

		const headerContainer = cardContainer.createDiv({ cls: 'flex-container' })
		headerContainer.createEl("span", { text: this.data.name });
		const optButtons = headerContainer.createEl("button", {})
		setIcon(optButtons, 'ellipsis-vertical')
		optButtons.onclick = (e) => {
			const event = new MouseEvent("contextmenu", {
				bubbles: true,
				cancelable: true,
				view: window,
				clientX: e.clientX,
				clientY: e.clientY,
			});

			optButtons.dispatchEvent(event);
		}

		const imageField = this.entitySchema.fields.find((field) => field.type == 'file')
		const imageContainer = cardContainer.createDiv({ cls: 'image-card-container' })
		if (imageField) {
			// TODO Make img-cover style
			const currentFolder = await getCurrentFolder(this.app)
			const fileImage = getFileByPath(this.app, `${currentFolder}/${this.data[imageField.name]}`)
			if (fileImage) {
				const imagePath = this.app.vault.getResourcePath(fileImage);
				imageContainer.createEl('img', {
					cls: 'card-image',
					attr: {
						src: imagePath,
						width: "200",
						loading: 'lazy'
					}
				})
			} else {
				new Notice('An error has occured')
			}
		}
	}
}

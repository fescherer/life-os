import { ItemView, setIcon, WorkspaceLeaf } from "obsidian";
import { getEntityData, getEntitySchema, } from "src/utils/entity-util";
import { updateMDFile } from "src/utils/markdown-manager";

export const CARD_VIEW_TYPE = "card-view";

export class CardView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return CARD_VIEW_TYPE;
	}

	getDisplayText() {
		return "Card View";
	}

	async onOpen() {
		const { contentEl } = this;

		const entitySchema = await getEntitySchema(this.app)
		const entityData = await getEntityData(this.app)

		contentEl.empty();
		contentEl.createEl("h2", { text: `Hello! You are seeing schema of ${entityData.label}` });
		const cardContainer = contentEl.createDiv({ cls: 'card-container ' })

		entityData.data.map((data, a, b) => {
			console.log("data: ", data, a, b)
			const card = cardContainer.createDiv({ cls: "card" });
			const btnContainer = card.createDiv({ cls: "btn-container" })
			const btnEdit = btnContainer.createEl("button", { cls: "icon-button" });
			setIcon(btnEdit, "pencil");
			btnEdit.onclick = () => {
				console.log('Edit card', a)
			}
			const btnRemove = btnContainer.createEl("button", { cls: "icon-button" });
			setIcon(btnRemove, "trash");
			btnRemove.onclick = async () => {
				console.log('Remove card', a)
				const activeFile = this.app.workspace.getActiveFile();
				const currentFolder = activeFile?.parent?.path;
				const entityData = await getEntityData(this.app)

				// TODO Here is deleting by name, but this deletes duplicate data, which is not intended. We need to create unique ids
				const newData = entityData.data.filter((item) => item.name !== data.name)
				const jsonString = JSON.stringify({ ...entityData, data: newData }, null, 2);

				if (currentFolder)
					await updateMDFile(this.app.vault, `${currentFolder}/data.md`, jsonString)

				this.onOpen()
			}
			card.createEl("h3", { text: `Field Index: ${a.toString()}` });

			Object.keys(data).map(fieldName => {
				const fieldType = entitySchema.fields.find((field) => field.name === fieldName)
				if (!fieldType) return

				switch (fieldType.type) {
					case 'string':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'number':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'boolean':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'date':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'select':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'multiselect':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'url':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'file':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'array':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					case 'conditional':
						card.createEl("span", { text: `${fieldType.name}: ${data[fieldName]}` });
						break;
					default:
						console.log('No item')
						break;
				}
			})
			// const type = entitySchema.fields.find(f => {
			//     if(f == [Object.keys(data)])
			// });
			// const value = data[key];


		})
	}

	async onClose() {
		// Clean up if needed
	}
}

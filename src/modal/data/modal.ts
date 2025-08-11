import { Modal, App, Setting, Notice } from "obsidian";
import { TDataItem } from "src/types/data";
import { getCurrentFolder } from "src/utils/folderName";
import { renderData } from "./render/_render";
import { getEntityData } from "src/utils/entity-data-manager";
import { getFileByPath } from "src/utils/markdown-manager";
import { getEntitySchema } from "src/utils/entity-schema-manager";

export class ModalDataForm extends Modal {
	dataItem: TDataItem
	isUpdate: boolean
	isSubmited: boolean
	entityCountID: number;
	defaultData: TDataItem | undefined
	title: string
	buttonText: string

	constructor(app: App, defaultData?: TDataItem) {
		super(app);
		this.isUpdate = defaultData ? true : false
		this.defaultData = defaultData
		this.isSubmited = false;
		this.entityCountID = 0;
		this.dataItem = defaultData ? defaultData : {
			id: '',
			name: '',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}

		this.title = defaultData ? `Edit ${this.dataItem.label}` : 'Create new Data'
		this.buttonText = defaultData ? `Edit data for ${this.dataItem.label}` : "Create"
	}

	async onOpen() {
		const { contentEl } = this;

		const currentFolder = await getCurrentFolder(this.app)
		const file = getFileByPath(this.app, `${currentFolder}/entity.md`)
		if (!file) {
			contentEl.createEl("h2", { text: "Entity Schema not found!" });
			contentEl.createEl('p', { text: "Make sure you first create an entity schema before trying to create data" })

			new Setting(contentEl)
				.addButton(btn => {
					btn.setButtonText('Ok').onClick(() => this.close())
				})
		} else {
			const entityData = await getEntityData(this.app);
			if (!entityData) return;

			if (this.defaultData) {
				this.entityCountID = entityData.idCount
			} else {
				const newEntityDataIdCount = entityData.idCount + 1;
				this.entityCountID = newEntityDataIdCount;
				this.dataItem.id = newEntityDataIdCount.toString().padStart(3, '0');
			}
			renderData(this)
		}
	}

	async onClose() {
		console.log('closing')
		if (!this.isSubmited) {
			console.log(`is submited`, this.isSubmited)
			new Notice("You close before saving. Nothing was created");

			const currentFolder = await getCurrentFolder(this.app)
			const file = getFileByPath(this.app, `${currentFolder}/entity.md`)
			if (file) {
				const entitySchema = await getEntitySchema(this.app)
				if (!entitySchema) return
				entitySchema.fields.map(async (field) => {
					if (field.type === 'file') {
						const fileName = this.dataItem[field.name]
						const file = getFileByPath(this.app, `${currentFolder}/${fileName}`)

						if (file) await this.app.vault.delete(file)
					}
				})
			}
			const { contentEl } = this;
			contentEl.empty();
		}
	}
}

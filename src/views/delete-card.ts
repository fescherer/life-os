import { App, Notice, TFile } from "obsidian"
import { TDataItem } from "src/types/data"
import { ConfirmDialog } from "src/ui/confirm-dialog.ui"
import { getEntityData } from "src/utils/entity-data-manager"
import { getEntitySchema } from "src/utils/entity-schema-manager"
import { getCurrentFolder } from "src/utils/folderName"
import { updateOrCreateMDFile } from "src/utils/markdown-manager"

export function deleteCard(app: App, data: TDataItem) {
	new ConfirmDialog(app,
		'Do you want to remove this item?',
		async () => {
			const currentFolder = await getCurrentFolder(app)
			const entityData = await getEntityData(app)
			const entitySchema = await getEntitySchema(app)

			if (!entityData || !entitySchema) return

			entitySchema.fields.map(async (field) => {
				if (field.type === 'file') {
					const foundFile = app.vault.getAbstractFileByPath(`${currentFolder}/files/${data[field.name]}`);

					if (foundFile instanceof TFile) {
						await app.vault.delete(foundFile);
					}
				}
				if (field.type === 'markdown') {
					const foundFileMD = app.vault.getAbstractFileByPath(`${currentFolder}/${data[field.name]}`);

					if (foundFileMD instanceof TFile) {
						await app.vault.delete(foundFileMD);
					}
				}
			})

			const newData = entityData.data.filter((item) => item.id !== data.id)
			const jsonString = JSON.stringify({ ...entityData, data: newData }, null, 2);

			if (currentFolder)
				await updateOrCreateMDFile(app, `${currentFolder}/data.md`, jsonString)
			new Notice(`You have deleted an item from ${entityData.label}`)
		}, () => { }).open()
}

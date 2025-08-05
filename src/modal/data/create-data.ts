import { App, Notice, TAbstractFile, TFile } from "obsidian";
import { TData, TDataItem } from "src/types/data";
import { TEntity, TFileField } from "src/types/field";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";
import { getEntityData, getEntitySchema } from "src/utils/entity-util";
import { getCurrentFolder } from "src/utils/folderName";
import { updateMDFile } from "src/utils/markdown-manager";
import { getMarkdownFilePath } from "./create-file";

export async function createData(app: App, dataItem: TDataItem, entityCountID: number, isSubmited: boolean, defautlData?: TDataItem) {
	const currentFolder = await getCurrentFolder(app)
	const entityData = await getEntityData(app)
	if (defautlData) {
		dataItem.updatedAt = new Date().toISOString()
		new ConfirmDialog(app, 'Are you sure you want to update this item?', async () => {
			const jsonString = JSON.stringify({ ...entityData, data: [...entityData.data.filter(item => item.id != dataItem.id), dataItem] }, null, 2);
			if (currentFolder)
				await updateMDFile(app.vault, `${currentFolder}/data.md`, jsonString)
		}, () => {
			new Notice('You canceled the edit')
		})
	} else {
		dataItem.createdAt = new Date().toISOString()
		dataItem.updatedAt = new Date().toISOString()

		const validate = await validateEntityData(app, dataItem)
		if (validate.isValid) {
			if (!defautlData) {
				const entitySchema = await getEntitySchema(app)
				const markdownFiles = entitySchema.fields.filter(item => item.type === 'markdown') as TFileField[]
				markdownFiles.forEach(markdownfield => {
					createMarkdownFile(app, dataItem, markdownfield, entitySchema)
				});
			}


			const completeData: TData = { ...entityData, idCount: entityCountID, data: [...entityData.data, dataItem] }
			console.log(completeData)
			const jsonString = JSON.stringify(completeData, null, 2);
			if (currentFolder)
				await updateMDFile(app.vault, `${currentFolder}/data.md`, jsonString)
			isSubmited = true
			// close()
		}
		else {
			new Notice(`Fill all the fields! ${validate.missingFields}`)
		}
	}
}

async function createMarkdownFile(app: App, dataItem: TDataItem, markdownFile: TFileField, entitySchema: TEntity): Promise<TAbstractFile | null> {
	if (!markdownFile) return null

	const currentPath = await getCurrentFolder(app)
	const hasFolderCreated = app.vault.getFolderByPath(`${currentPath}/md`)
	if (!hasFolderCreated) {
		app.vault.createFolder(`${currentPath}/md`);
	}

	const filePath = getMarkdownFilePath(markdownFile, entitySchema, dataItem.id)

	await app.vault.create(`${currentPath}/${filePath}`, `# MD File\n`);
	const newFile = app.vault.getAbstractFileByPath(`${currentPath}/${filePath}`);
	await app.workspace.getLeaf(true).openFile(newFile as TFile);
	const file = app.vault.getAbstractFileByPath(`${currentPath}/${filePath}`);
	return file
}

async function validateEntityData(app: App, dataItem: TDataItem) {
	const entitySchema = await getEntitySchema(app)
	const missingFields = [];

	for (const field of entitySchema.fields) {
		const value = dataItem[field.name];

		const isEmpty = value === undefined || value === null

		if (isEmpty)
			missingFields.push(field.name);
	}

	return {
		isValid: missingFields.length === 0,
		missingFields
	};
}

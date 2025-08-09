import { App, normalizePath, Notice } from "obsidian";
import { getCurrentFolder } from "./folderName";
import { TData, TDataItem } from "src/types/data";
import { getFileByPath, readMDFile, updateOrCreateFileWithPath, updateOrCreateMDFile } from "./markdown-manager";
import { slugify } from "./slugify";
import { getEntitySchema } from "./entity-schema-manager";
import { TValidate } from "src/types/util";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";

/**
	* Update data.md file with new TDataItem (Create files and markdown if necessary).
	* @param app - The Obsidian app instance (typically `this.app`).
	* @param dataItem - TDataItem to be added to TData
	* @returns TData or null.
**/
export async function createEntityData(app: App, dataItem: TDataItem): Promise<TData | null> {
	dataItem.createdAt = new Date().toISOString()
	dataItem.updatedAt = new Date().toISOString()

	const validate = await validateEntityDataItem(app, dataItem)
	if (validate.isValid) {
		const currentFolder = await getCurrentFolder(app)
		const entitySchema = await getEntitySchema(app)
		const entityData = await getEntityData(app)
		if (!entityData || !entitySchema) return null

		// Create markdown files with there is markdown fields
		entitySchema.fields.filter(item => item.type === 'markdown').forEach(markdownfield => {
			const filePath = `md/${slugify(dataItem.name)}-${dataItem.id}-${markdownfield.id}.md`
			updateOrCreateFileWithPath(app, `${currentFolder}/${filePath}`, '# MD File. Do not change the file Name\n')
		});

		const newIdCount = (entityData.idCount + 1)
		dataItem.id = newIdCount.toString().padStart(3, '0')

		const completeData: TData = {
			...entityData,
			idCount: newIdCount,
			data: [...entityData.data, dataItem]
		}
		const jsonString = JSON.stringify(completeData, null, 2);
		const success = await updateOrCreateMDFile(app, `${currentFolder}/data.md`, jsonString)
		return success ? completeData : null
	}

	else {
		new Notice(`Fill all the fields! ${validate.missingFields}`)
		return null
	}
}

/**
	* Update TDataItem in the TData block data (Create files and markdown if necessary).
	* @param app - The Obsidian app instance (typically `this.app`).
	* @param dataItem - TDataItem to be modify
	* @returns TData or null.
**/
export async function updateEntityData(app: App, dataItem: TDataItem) {
	dataItem.updatedAt = new Date().toISOString()

	const validate = await validateEntityDataItem(app, dataItem)
	if (validate.isValid) {
		const currentFolder = await getCurrentFolder(app)
		const entityData = await getEntityData(app)
		if (!entityData) return null

		// TODO, if user changes File type it would be a big problem if the image was deleted, we need to make some logic here
		// When open the edit, a file will be loaded
		// If user chooses other file to overwrite this one, we need to save this as a temp file, maybe in the filename put a temp prefix
		// If user chooses other file, we overwrite the temp one and looses the previous (There is no problem doing that)
		// If user finishes the edit, we make something similar to delete. We need to write in log.md that user has updated a file and also copy that file to a folder with id and all of that
		// After succefully moving the file, we rename the temp one to a original file
		// The image name itself will be the same, but we can update that too   


		new ConfirmDialog(app, 'Are you sure you want to update this item?', async () => {
			const completeData = {
				...entityData,
				data: [...entityData.data.filter(item => item.id != dataItem.id), dataItem].sort((a, b) => Number(a.id) - Number(b.id))
			}
			const jsonString = JSON.stringify(completeData, null, 2);

			const success = await updateOrCreateMDFile(app, `${currentFolder}/data.md`, jsonString)
			return success ? completeData : null
		}, () => {
			new Notice('You canceled the edit')
		}).open()
	} else {
		new Notice(`Fill all the fields! ${validate.missingFields}`)
		return null
	}
}

/**
	* Validates a given TEntityData
	* @param app - The Obsidian app instance (typically `this.app`).
	* @param dataItem - TDataItem to be validate
	* @returns TValidate
**/
export async function validateEntityDataItem(app: App, data: TDataItem): Promise<TValidate> {
	const entitySchema = await getEntitySchema(app)
	if (!entitySchema) return {
		isValid: false,
		missingFields: []
	}

	const missingFields = [];

	for (const field of entitySchema.fields) {
		const value = data[field.name];

		const isEmpty = value === undefined || value === null

		if (isEmpty)
			missingFields.push(field.name);
	}

	return {
		isValid: missingFields.length === 0,
		missingFields
	};
}


/**
	* Returns TEntityData
	* @param app - The Obsidian app instance (typically `this.app`).
	* @returns TEntityData
**/
export async function getEntityData(app: App): Promise<TData | null> {
	const currentFolder = await getCurrentFolder(app)
	const data = readMDFile<TData>(this.app, `${currentFolder}/data.md`) as Promise<TData>
	if (!data) new Notice('Fail to load data.md')
	return data
}


/**
	* Deletes a given TEntityDataItem
	* @param app - The Obsidian app instance (typically `this.app`).
	* @param dataItem - TDataItem to be validate
	* @returns TDataItem or null
**/
export async function deleteEntityDataItem(app: App, data: TDataItem): Promise<TDataItem | null> {
	new ConfirmDialog(app,
		'Do you want to remove this item?', async () => {
			const currentFolder = await getCurrentFolder(app)
			const entityData = await getEntityData(app)
			const entitySchema = await getEntitySchema(app)

			if (!entityData || !entitySchema) return

			const randomId = crypto.randomUUID()
			const completeId = `${entitySchema.entity}-${data.name}-${randomId}`

			if (!(app.vault.getAbstractFileByPath(normalizePath('trash-bin')))) {
				await app.vault.createFolder('trash-bin');
			}
			await app.vault.createFolder(`trash-bin/${completeId}`);

			const completeData = {
				schema: entitySchema,
				deletedData: data,
			}

			const jsonString = JSON.stringify(completeData, null, 2);
			await app.vault.create(`trash-bin/${completeId}/${completeId}.md`, jsonString);

			const newData = { ...entityData, data: entityData.data.filter(item => item.id !== data.id) }
			const newDataJsonString = JSON.stringify(newData, null, 2);
			await updateOrCreateMDFile(app, `${currentFolder}/data.md`, newDataJsonString)

			entitySchema.fields.map(async (field) => {
				if (field.type === 'file' || field.type === 'markdown') {

					const file = getFileByPath(app, `${currentFolder}/files/${data[field.name]}`)
					if (file) await app.vault.rename(file, `trash-bin/${completeId}`);
				}
			})
			return newData
		}, () => null).open()
	return null
}

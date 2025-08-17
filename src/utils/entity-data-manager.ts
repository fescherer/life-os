import { App, Notice } from "obsidian";
import { getCurrentFolder } from "./folderName";
import { TData, TDataItem } from "src/types/data";
import { createlogBackupItem, getFileByPath, readMDFile, updateOrCreateFileWithPath, updateOrCreateMDFile } from "./markdown-manager";
import { slugify } from "./slugify";
import { getEntitySchema } from "./entity-schema-manager";
import { TValidate } from "src/types/util";
import { ConfirmDialog } from "src/ui/confirm-dialog.ui";
import { JSONCodeBlock } from "./json-code-block";
import { warn } from "./warn";

async function updateFiles(app: App, aux: Record<string, { file: File, id: string }[]>, dataItem: TDataItem) {
	const entitySchema = await getEntitySchema(app)
	if (!entitySchema?.fields.find(schema => schema.type == 'file')) return

	const currentFolder = await getCurrentFolder(app)
	if (!(await app.vault.adapter.exists(`${currentFolder}/files`))) {
		await app.vault.createFolder(`${currentFolder}/files`);
	}

	for (const auxKey of Object.keys(aux)) {
		const oldPaths: string[] = dataItem[auxKey]?.split("||").filter(Boolean) ?? []; // filter(Boolean) serve para remover qualquer valor falsy
		if (oldPaths.length != 0) {
			await createlogBackupItem(app, JSONCodeBlock({ update: oldPaths }), oldPaths.map(path => `${currentFolder}/${path}`))
		}


		const newFiles = aux[auxKey];
		const newPaths: string[] = [];

		for (let indx = 0; indx < newFiles.length; indx++) {
			const fileObj = newFiles[indx];
			const ext = fileObj.file.name.substring(fileObj.file.name.lastIndexOf(".") + 1).toLowerCase();
			const fileName = `${dataItem.name}-${dataItem.id}-${auxKey}-${indx}.${ext}`;
			const fullPath = `${currentFolder}/files/${fileName}`;

			const arrayBuffer = await fileObj.file.arrayBuffer();
			await app.vault.createBinary(fullPath, arrayBuffer);
			newPaths.push(`files/${fileName}`);
		}
		dataItem[auxKey] = newPaths.join("||");
	}
}

// async function updateFiles(app: App, aux: Record<string, { file: File, id: string }[]>, dataItem: TDataItem) {
// 	const entitySchema = await getEntitySchema(app)
// 	if (!entitySchema?.fields.find(schema => schema.type == 'file')) return

// 	const currentFolder = await getCurrentFolder(app)
// 	if (!(await app.vault.adapter.exists(`${currentFolder}/files`))) {
// 		await app.vault.createFolder(`${currentFolder}/files`);
// 	}

// 	const auxKeys = Object.keys(aux)
// 	for (const auxKey of auxKeys) {
// 		const oldPaths: string[] = dataItem[auxKey]?.split("||").filter(Boolean) ?? []; // filter(Boolean) serve para remover qualquer valor falsy
// 		const newFiles = aux[auxKey];
// 		const newPaths: string[] = [];
// 		const oldPathSet = new Set(oldPaths);

// 		for (let indx = 0; indx < newFiles.length; indx++) {
// 			const fileObj = newFiles[indx];
// 			const ext = fileObj.file.name.substring(fileObj.file.name.lastIndexOf(".") + 1).toLowerCase();
// 			const fileName = `${dataItem.name}-${dataItem.id}-${auxKey}-${indx}.${ext}`;
// 			const relativePath = `files/${fileName}`;
// 			const fullPath = `${currentFolder}/files/${fileName}`;

// 			if (oldPathSet.has(relativePath)) {
// 				newPaths.push(relativePath);
// 				oldPathSet.delete(relativePath);
// 			} else {
// 				const arrayBuffer = await fileObj.file.arrayBuffer();
// 				await app.vault.createBinary(fullPath, arrayBuffer);
// 				newPaths.push(relativePath);
// 			}
// 		}

// 		if (oldPathSet.size != 0) {
// 			await createlogBackupItem(app, JSONCodeBlock({ moved: [...oldPathSet] }), [...oldPathSet].map(path => `${currentFolder}/${path}`))
// 		}

// 		dataItem[auxKey] = newPaths.join("||");
// 	}
// }

/**
	* Update data.md file with new TDataItem (Create files and markdown if necessary).
	* @param app - The Obsidian app instance (typically `this.app`).
	* @param dataItem - TDataItem to be added to TData
	* @returns TData or null.
**/
export async function createEntityData(app: App, dataItem: TDataItem, aux: Record<string, { file: File, id: string }[]>): Promise<TData | null> {
	dataItem.createdAt = new Date().toISOString()
	dataItem.updatedAt = new Date().toISOString()

	const validate = await validateEntityDataItem(app, dataItem, aux)
	if (validate.isValid) {
		const currentFolder = await getCurrentFolder(app)
		const entitySchema = await getEntitySchema(app)
		const entityData = await getEntityData(app)
		if (!entityData || !entitySchema) return null

		await updateFiles(app, aux, dataItem)

		entitySchema.fields.forEach(field => {
			// Create markdown files with there is markdown fields
			if (field.type === 'markdown') {
				const filePath = `md/${slugify(dataItem.name)}-${dataItem.id}-${field.id}.md`
				dataItem[field.name] = filePath
				updateOrCreateFileWithPath(app, `${currentFolder}/${filePath}`, '# MD File. Do not change the file Name\n')
			}
		});


		const newIdCount = (entityData.idCount + 1)
		dataItem.id = newIdCount.toString().padStart(3, '0')

		const completeData: TData = {
			...entityData,
			idCount: newIdCount,
			data: [...entityData.data, dataItem]
		}

		const success = await updateOrCreateMDFile(app, `${currentFolder}/data.md`, JSONCodeBlock(completeData))
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
export async function updateEntityData(app: App, dataItem: TDataItem, aux: Record<string, { file: File, id: string }[]>): Promise<TData | null> {

	const validate = await validateEntityDataItem(app, dataItem, aux)
	if (validate.isValid) {
		const currentFolder = await getCurrentFolder(app)
		const entityData = await getEntityData(app)
		if (!entityData) return null

		return new Promise<TData | null>((resolve) => {
			new ConfirmDialog(app, 'Are you sure you want to update this item?', async () => {
				dataItem.updatedAt = new Date().toISOString()
				await updateFiles(app, aux, dataItem)

				const completeData = {
					...entityData,
					data: [...entityData.data.filter(item => item.id != dataItem.id), dataItem].sort((a, b) => Number(a.id) - Number(b.id))
				}
				const jsonString = JSONCodeBlock(completeData);
				console.log('new updateData', completeData)
				const success = await updateOrCreateMDFile(app, `${currentFolder}/data.md`, jsonString)
				resolve(success ? completeData : null);
			}, () => {
				new Notice('You canceled the edit')
				resolve(null);
			}).open()
		});

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
export async function validateEntityDataItem(app: App, data: TDataItem, aux: Record<string, { file: File, id: string }[]>): Promise<TValidate> {
	const entitySchema = await getEntitySchema(app)
	if (!entitySchema) return {
		isValid: false,
		missingFields: []
	}

	const validateAuxValue = validateAux(aux)
	if (validateAuxValue.length) return {
		isValid: false,
		missingFields: validateAuxValue
	}

	const missingFields = [];

	for (const field of entitySchema.fields) {
		if (field.type != 'file') {
			const value = data[field.name];

			const isEmpty = value === undefined || value === null

			if (isEmpty)
				missingFields.push(field.name);
		}
	}

	if (!data.name) missingFields.push('name')

	return {
		isValid: missingFields.length === 0,
		missingFields
	};
}

function validateAux(aux: Record<string, { file: File; id: string }[]>): string[] {
	if (Object.keys(aux).length === 0) return [];

	const missingFields: string[] = []
	for (const key in aux) {
		if (!aux[key] || aux[key].length === 0) {
			missingFields.push(key)
		}
	}

	return missingFields
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

			const pendingPathFiles: string[] = []
			entitySchema.fields.map(async (field) => {
				if (field.type === 'file' || field.type === 'markdown') {

					const file = getFileByPath(app, `${currentFolder}/${data[field.name]}`)
					if (file)
						pendingPathFiles.push(file.path)
					else
						await warn(app, `File at ${currentFolder}/${data[field.name]} not found`)
				}
			})

			const completeData = {
				schema: entitySchema,
				deletedData: data,
			}

			const newData = { ...entityData, data: entityData.data.filter(item => item.id !== data.id) }
			await updateOrCreateMDFile(app, `${currentFolder}/data.md`, JSONCodeBlock(newData))
			await createlogBackupItem(app, JSONCodeBlock(completeData), pendingPathFiles)
			return newData
		}, () => null).open()
	return null
}

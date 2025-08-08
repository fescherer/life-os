import { App, Notice } from "obsidian";
import { createNewFolderInCurrentDir, getCurrentFolder, getFolderName } from "./folderName";
import { readMDFile, updateOrCreateMDFile } from "./markdown-manager";
import { TEntity, TField } from "src/types/field";
import { TValidate } from "src/types/util";

export async function createEntityFolder(app: App, entity: TEntity): Promise<boolean> {
	const folderName = getFolderName(app, entity.label);
	await createNewFolderInCurrentDir(app, folderName)

	const jsonString = JSON.stringify(entity, null, 2);
	const entityResponse = await updateOrCreateMDFile(app, `${folderName}/entity.md`, jsonString)
	if (!entityResponse) return false

	const jsonStringData = JSON.stringify({
		entity: entity.entity,
		label: entity.label,
		idCount: 0,
		data: []
	}, null, 2)
	return await updateOrCreateMDFile(app, `${folderName}/data.md`, jsonStringData)
}

/*
	* Update entity.md file with new entity (Create data file too).
	* @param app - Obsidian app object.
	* @param entity - creates new entity item base on schema.
	* @returns TEntity item or null.
*/
export async function createEntitySchema(app: App, entity: TEntity): Promise<TEntity | null> {
	if (entity.fields.length <= 0) {
		new Notice("Add at least one field")
		return null
	}

	const validate = await validateEntitySchema(entity)
	if (validate.isValid) {
		createEntityFolder(app, entity)
		return entity
	} else {
		new Notice(`Fill all the fields! ${validate.missingFields}`)
		return null
	}
}


/*
	* Update entity.md file.
	* @param app - Obsidian app object.
	* @returns TData item or null.
*/
export async function updateEntitySchema(app: App, entity: TEntity) {
	// wip TODO - 
	// If user has add or remove some fields, we need to or, add a default value to all the data, or remove all the fields removed from data

	const validate = await validateEntitySchema(entity)
	if (validate.isValid) {
		const currentFolder = await getCurrentFolder(app)

		const jsonString = JSON.stringify(entity, null, 2);
		await updateOrCreateMDFile(app, `${currentFolder}/entity.md`, jsonString)
	} else {
		new Notice(`Fill all the fields! ${validate.missingFields}`)
		return null
	}
}

/*
	* Validate entity schema.
	* @param entity - Entity to be validated.
	* @returns TData item or null.
*/
export async function validateEntitySchema(entity: TEntity): Promise<TValidate> {
	if (!entity || !entity.entity || !entity.label) return {
		isValid: false,
		missingFields: ['entity.name']
	}
	const missingFields = [];

	for (const field of entity.fields) {
		if (!isFieldValid(field))
			missingFields.push(field.name);
	}

	return {
		isValid: missingFields.length === 0,
		missingFields
	};
}

function isFieldValid(field: TField): boolean {
	if (!field.name || !field.label) return false;

	switch (field.type) {
		case 'string':
		case 'boolean':
		case 'date':
		case 'url':
		case 'file':
		case 'markdown':
		case 'array':
			return true;

		case 'number':
			return typeof field.precision === 'number';

		case 'select':
			return Array.isArray(field.options) && field.options.length > 0;

		default:
			return false;
	}
}


/*
	* Read entity.md markdown file of current folder.
	* @param app - Obsidian app object.
	* @returns TEntity item or null.
*/
export async function getEntitySchema(app: App): Promise<TEntity | null> {
	const currentFolder = await getCurrentFolder(app)
	const entity = readMDFile(app.vault, `${currentFolder}/entity.md`) as Promise<TEntity>
	if (!entity) new Notice('Fail to load entity.md')
	return entity
}

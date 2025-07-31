import { TEntity } from "src/types/field";
import { readMDFile, updateMDFile, writeMDFile } from "./markdown-manager";
import { App } from "obsidian";
import { createNewFolderInCurrentDir, getCurrentFolder, getFolderName } from "./folderName";
import { TData } from "src/types/data";


export async function createEntityFolder(entity: TEntity) {
	const folderName = getFolderName(this.app, 'NewFolder');
	await createNewFolderInCurrentDir(this.app, folderName)

	const jsonString = JSON.stringify(entity, null, 2);
	await writeMDFile(this.app, folderName, 'entity.md', jsonString)

	const jsonStringData = JSON.stringify({
		entity: entity.entity,
		label: entity.label,
		idCount: 0,
		data: []
	} as TData, null, 2)
	await writeMDFile(this.app, folderName, 'data.md', jsonStringData)
}

export async function updateEntityFolder(app: App, entity: TEntity) {
	const currentFolder = await getCurrentFolder(app)

	const jsonString = JSON.stringify(entity, null, 2);
	await updateMDFile(this.app.vault, `${currentFolder}/entity.md`, jsonString)
}



export async function getEntitySchema(app: App): Promise<TEntity> {
	const currentFolder = await getCurrentFolder(app)

	return readMDFile(app.vault, `${currentFolder}/entity.md`) as Promise<TEntity>
}

export function postEntitySchema() {

}

export async function getEntityData(app: App): Promise<TData> {
	const currentFolder = await getCurrentFolder(app)
	return readMDFile(this.app.vault, `${currentFolder}/data.md`) as Promise<TData>

}

export function postEntityData() {

}

import { TData, TEntity } from "src/types/field";
import { readMDFile, writeMDFile } from "./markdown-manager";
import { App } from "obsidian";
import { createNewFolderInCurrentDir, getFolderName } from "./folderName";


export async function createEntityFolder(entity: TEntity) {
    // Create Folder
    const folderName = getFolderName(this.app, 'NewFolder');
    await createNewFolderInCurrentDir(this.app, folderName)

    // Create Schema File
    const jsonString = JSON.stringify(entity, null, 2);
    await writeMDFile(this.app, folderName, 'entity.md', jsonString)

    // Create Data File
    const jsonStringData = JSON.stringify({
        entity: entity.entity,
        label: entity.label,
        data: []
    }, null, 2)
    await writeMDFile(this.app, folderName, 'data.md', jsonStringData)
}


export function getEntitySchema(app: App): Promise<TEntity> {
    const activeFile = app.workspace.getActiveFile();
    const currentFolder = activeFile?.parent?.path;

    return readMDFile(app.vault, `${currentFolder}/entity.md`) as Promise<TEntity>
}

export function postEntitySchema() {

}

export function getEntityData(app: App): Promise<TData> {
    const activeFile = app.workspace.getActiveFile();
    const currentFolder = activeFile?.parent?.path;
    return readMDFile(this.app.vault, `${currentFolder}/data.md`) as Promise<TData>

}

export function postEntityData() {

}
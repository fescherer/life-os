import { App } from "obsidian";

export async function createNewFolderInCurrentDir(app: App, folderName: string) {
    try {
        await app.vault.createFolder(folderName);
    } catch (err) {
        console.error("Failed to create folder:", err);
    }
}


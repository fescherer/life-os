import { App } from "obsidian";

export function getFolderName(app: App, baseName: string) {
	const activeFile = app.workspace.getActiveFile();
	if (activeFile?.parent) {
		const currentFolder = activeFile.parent;
		return getAvailableFolderName(app, currentFolder.path, baseName);
	} else {
		return getAvailableFolderName(app, '/', baseName);
	}
}

function getAvailableFolderName(app: App, baseFolderPath: string, baseName: string): string {
	const isRootPath = baseFolderPath === '/'

	if (isRootPath && !app.vault.getAbstractFileByPath(`${baseName}`)) {
		return baseName;
	}
	else if (isRootPath && app.vault.getAbstractFileByPath(`${baseName}`)) {
		let i = 1;
		while (app.vault.getAbstractFileByPath(`${baseName} ${i}`)) {
			i++;
		}
		return `${baseName} ${i}`;
	} else if (!app.vault.getAbstractFileByPath(`${baseFolderPath}/${baseName}`)) {
		return `${baseFolderPath}/${baseName}`;
	} else {
		let i = 1;
		while (app.vault.getAbstractFileByPath(`${baseFolderPath}/${baseName} ${i}`)) {
			i++;
		}
		return `${baseFolderPath}/${baseName} ${i}`;
	}
}

export async function createNewFolderInCurrentDir(app: App, folderName: string) {
	try {
		await app.vault.createFolder(folderName);
	} catch (err) {
		console.error("Failed to create folder:", err);
	}
}

import { App } from "obsidian";

export function getFolderName(app: App, baseName: string) {
    const activeFile = app.workspace.getActiveFile();
    if (activeFile && activeFile.parent) {
        const currentFolder = activeFile.parent;
        return getAvailableFolderName(app, currentFolder.path, baseName);
    } else {
        return getAvailableFolderName(app, '/', baseName);
    }
}

function getAvailableFolderName(app: App, baseFolderPath: string, baseName: string): string {
    if (baseFolderPath === '/' && !app.vault.getAbstractFileByPath(`${baseName}`)) {
        return baseName;
    }
    else if (baseFolderPath === '/' && app.vault.getAbstractFileByPath(`${baseName}`)) {
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
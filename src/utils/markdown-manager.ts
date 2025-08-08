import { App, normalizePath, TFile, Vault } from "obsidian";
import { TData } from "src/types/data";

export function getFileByPath(app: App, path: string): TFile | null {
    const normalized = normalizePath(path);
    const file = app.vault.getAbstractFileByPath(normalized);
    if (!(file instanceof TFile)) {
        console.warn(`File not found: ${normalized}`);
        return null;
    }
    return file;
}

export async function readMDFile(vault: Vault, filePath: string): Promise<unknown | null> {
    const file = vault.getAbstractFileByPath(normalizePath(filePath));

    if (!(file instanceof TFile)) {
        console.warn(`File not found: ${filePath}`);
        return null;
    }

    const content = await vault.read(file);

    const match = content.match(/````?json\s*([\s\S]*?)\s*````?/i);
    if (!match) {
        console.warn(`No JSON block found in ${filePath}`);
        return null;
    }

    try {
        const json = JSON.parse(match[1]);
        return json;
    } catch (err) {
        console.error("Failed to parse JSON block:", err);
        return null;
    }
}

/**
 * Creates a file at the given path, including any missing folders recursively.
 * @param app The Obsidian app instance (typically `this.app`)
 * @param fullPath The full path including folders and file name with extension (e.g., "folder1/folder2/file.txt")
 * @param content Optional content to initialize the file with
 * @returns The created file object
 */
export async function updateOrCreateFileWithPath(
    app: App,
    fullPath: string,
    content: string = ""
): Promise<TFile> {
    const normalizedPath = normalizePath(fullPath);

    // Split path into folders and file
    const pathParts = normalizedPath.split("/");
    const fileName = pathParts.pop()!;
    const folderPath = pathParts.join("/");

    // Create folders recursively if they don't exist
    if (folderPath && !(await app.vault.adapter.exists(folderPath))) {
        const parts = normalizePath(folderPath).split("/");
        let currentPath = "";

        for (const part of parts) {
            currentPath = normalizePath(currentPath ? `${currentPath}/${part}` : part);
            if (!(await app.vault.adapter.exists(currentPath))) {
                await app.vault.createFolder(currentPath);
            }
        }
    }

    // Check if file already exists
    const file = getFileByPath(app, normalizedPath)
    if (file) {
        // Update File  
        await app.vault.modify(file, content)
        return file
    }

    else {
        // Create File
        const newFile = await app.vault.create(normalizedPath, content);
        await app.workspace.getLeaf(true).openFile(newFile as TFile);
        return newFile
    }
}

export async function updateOrCreateMDFile(
    app: App,
    filePath: string,
    jsonString: string
): Promise<boolean> {
    const file = getFileByPath(app, filePath)
    if (!file) {
        const content = "```json\n" + jsonString + "\n```";
        updateOrCreateFileWithPath(app, filePath, content)
        return true
    }

    const content = await app.vault.read(file);

    const updatedContent = content.replace(
        /````?json\s*([\s\S]*?)\s*````?/i,
        `\`\`\`json\n${jsonString}\n\`\`\``
    );

    if (updatedContent === content) {
        console.warn("No JSON block found to replace. Appending new JSON block.");
        await app.vault.modify(file, `${content.trim()}\n\n\`\`\`json\n${jsonString}\n\`\`\``);
        return true

    }

    await app.vault.modify(file, updatedContent);
    return true;
}
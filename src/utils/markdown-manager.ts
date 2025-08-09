import { App, normalizePath, TFile } from "obsidian";

/**
	* Get a file by given path.
	* @param app - The Obsidian app instance (typically `this.app`)
	* @param filePath - The full path including folders and file name with extension (e.g., "folder1/folder2/file.txt")
	* @returns TFile or null.
**/
export function getFileByPath(app: App, filePath: string): TFile | null {
	const normalized = normalizePath(filePath);
	const file = app.vault.getAbstractFileByPath(normalized);
	if (!(file instanceof TFile)) {
		console.warn(`File not found: ${normalized}`);
		return null;
	}
	return file;
}

/**
	* Read .md file and return the first JSON block found.
	* @param app - The Obsidian app instance (typically `this.app`)
	* @param filePath - The full path including folders and file name with extension (e.g., "folder1/folder2/file.txt")
	* @returns json object or null.
**/
export async function readMDFile<T>(app: App, filePath: string): Promise<T | null> {
	const file = getFileByPath(app, filePath)

	if (!file) {
		console.warn(`File not found: ${filePath}`);
		return null;
	}

	const content = await app.vault.read(file);

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
**/
export async function updateOrCreateFileWithPath(
	app: App,
	fullPath: string,
	content = ""
): Promise<TFile> {
	const normalizedPath = normalizePath(fullPath);

	// Split path into folders and file
	const pathParts = normalizedPath.split("/");
	pathParts.pop();
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

	const file = getFileByPath(app, normalizedPath)
	if (file) {
		await app.vault.modify(file, content)
		return file
	}

	else {
		const newFile = await app.vault.create(normalizedPath, content);
		await app.workspace.getLeaf(true).openFile(newFile as TFile);
		return newFile
	}
}

/**
 * Creates or updates a file with json block
 * @param app The Obsidian app instance (typically `this.app`)
 * @param filePath The full path including folders and file name with extension (e.g., "folder1/folder2/file.txt")
 * @param jsonString The string to save as json block in md file
 * @returns The created file object or null if error
**/
export async function updateOrCreateMDFile(app: App, filePath: string, jsonString: string): Promise<TFile | null> {
	try {
		const file = getFileByPath(app, filePath);
		const jsonBlock = `\`\`\`json\n${jsonString}\n\`\`\``;

		if (file) {
			await app.vault.modify(file, jsonBlock);
			return file;
		}

		const newFile = await updateOrCreateFileWithPath(app, filePath, jsonBlock);
		return newFile;
	} catch (err) {
		console.error("Error writing JSON block:", err);
		return null;
	}
}

/**
 * Creates a backup file and register of stuff did in the app
 * @param app The Obsidian app instance (typically `this.app`)
 * @param filePath The full path including folders and file name with extension (e.g., "folder1/folder2/file.txt")
 * @param jsonString The string to save as json block in md file
 * @returns The created file object or null if error
**/
export async function createLogItem(app: App, filePath: string, backupString: string, fileArray: string[]): Promise<TFile | null> {
	try {
		// Verify if folder log exists, if not, create one and also create a file log.md
		// The file log.md is supposed to store a log id, which is incremental 
		// generate randomID and create a folder - each folder will have the name as following "logs/<current-log-id>-<randomId>"
		// Inside this folder, we will have a file called backup.md, where is gonna store the data that is beeing deleted
		// This function need to return the backup.md

		const logPropertiesFile = getFileByPath(app, 'log/logProperties.md')
		if (!logPropertiesFile) await updateOrCreateFileWithPath(app, 'log/logProperties.md', "logId: 1") // Verificar qual a melhor formatação que podemos deixar no log.md

		const logPropertiesFileContent = await readMDFile<{ id: number }>(app, 'log/logProperties.md')
		if (!logPropertiesFileContent) return null

		const randomId = crypto.randomUUID()
		const folderName = `${logPropertiesFileContent.id}-${randomId}`
		await app.vault.createFolder(`log/${folderName}`);
		await app.vault.create(`log/${folderName}/backup.md`, backupString);

		fileArray.map(file => createLogFile(app, file, `log/${folderName}`, `Move ${file} to log/${folderName}`))


		const logFile = getFileByPath(app, `log/${folderName}/backup.md`)
		return logFile
	} catch (err) {
		return null;
	}
}

export async function createLogFile(app: App, filePath: string, targetPath: string, message: string) {
	// Verify if folder log exists, if not, there is a problem, and you need to return null or other error message
	// This function will also receives a path that is supposed to have the backup data.md
	// This function also will receive the path that is located the file to be copied
	// This function need to copy the file and save in the folder, I think this can have the same name
	// This function need to write in the log.md
	// This function need to delete from path that is currently file is located



}

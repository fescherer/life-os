import { App, normalizePath, TFile } from "obsidian";
import { JSONCodeBlock } from "./json-code-block";
import { warn } from "./warn";
import { TLog, TLogType } from "src/types/util";

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
		// console.warn(`File not found: ${normalized}`);
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
		return await app.vault.create(normalizedPath, content)
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

		if (file) {
			await app.vault.modify(file, jsonString).then(async () => {
				await createLogItem(app, `File updated at ${filePath}`, '✅')
			}).catch(async (err) => {
				await warn(app, `Update file ${filePath} got an error! ${err}`)
			})
			return file;
		}

		const newFile = await updateOrCreateFileWithPath(app, filePath, jsonString);
		return newFile;
	} catch (err) {
		console.error("Error writing JSON block:", err);
		return null;
	}
}

export async function createLogItem(app: App, message: string, logType: TLogType = '⚠️') {
	const logsPath = 'logs/logs.md'

	const logFilePath = getFileByPath(app, logsPath)
	if (!logFilePath) await updateOrCreateFileWithPath(app, logsPath, JSONCodeBlock([]))

	const logFile = await readMDFile<TLog[]>(app, logsPath)
	if (!logFile) {
		console.warn(`No log file found`)
		return null
	}

	const newLogs: TLog[] = [
		{
			id: logFile.length + 1,
			message,
			date: new Date().toISOString(),
			type: logType
		}
		, ...logFile
	]
	return await updateOrCreateFileWithPath(app, logsPath, JSONCodeBlock(newLogs))
}

/**
 * Creates a backup file and register of stuff did in the app
 * @param app The Obsidian app instance (typically `this.app`)
 * @param filePath The full path including folders and file name with extension (e.g., "folder1/folder2/file.txt")
 * @param jsonString The string to save as json block in md file
 * @returns The created file object or null if error
**/
export async function createlogBackupItem(app: App, backupString: string, moveArray: string[]): Promise<TFile | null> {
	try {
		// Verify if folder logs exists, if not, create one and also create a file logs.md
		// The file logs.md is supposed to store a logs id, which is incremental 
		// generate randomID and create a folder - each folder will have the name as following "logss/<current-logs-id>-<randomId>"
		// Inside this folder, we will have a file called backup.md, where is gonna store the data that is beeing deleted

		const propertiesPath = 'logs/properties.md'
		const logsPropertiesFilePath = getFileByPath(app, propertiesPath)
		if (!logsPropertiesFilePath) await updateOrCreateFileWithPath(app, propertiesPath, JSONCodeBlock({ id: 0 }))

		const logsPropertiesFile = await readMDFile<{ id: number }>(app, propertiesPath)
		if (!logsPropertiesFile) return null

		const randomId = crypto.randomUUID()
		const folderName = `${logsPropertiesFile.id + 1}-${randomId}`
		try {
			await app.vault.createFolder(`logs/${folderName}`);
			await app.vault.create(`logs/${folderName}/backup.md`, backupString)
			await createLogItem(app, `Backup file created at logs/${folderName}/backup.md`, '✅')
		} catch (err) {
			await warn(app, `Creating backup file logs/${folderName}/backup.md got an error! ${err}`)
		}

		try {
			moveArray.map(async (path) => {
				const file = getFileByPath(app, path)
				const filename = path.split('/').at(-1) || ''
				const randomFileId = crypto.randomUUID()
				console.log(`logs/${folderName}/${randomFileId}-${filename}`)
				if (file) await app.vault.rename(file, `logs/${folderName}/${randomFileId}-${filename}`)
				await createLogItem(app, `Move ${path} to logs/${folderName}`, '✅')
			})
		} catch (err) {
			await warn(app, `Moving file ${moveArray} got an error! ${err}`)
		}

		updateOrCreateMDFile(app, 'logs/properties.md', JSONCodeBlock({ id: logsPropertiesFile.id + 1 }))
		const logsFile = getFileByPath(app, `logs/${folderName}/backup.md`)
		return logsFile
	} catch (err) {
		return null;
	}
}




/*
logs STRUCTURE

logss
-> properties.md
-> logss.md
-> 1-cccc-bbbb-aaaa-1111
   -> img1.png
   -> img2.png
   -> backup.md
-> 2-dddd-2222-yyyy-ssss
   -> img5.png
   -> backup.md

*/

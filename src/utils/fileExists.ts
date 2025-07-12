import { App, normalizePath, TFile } from "obsidian";

export function fileExists(app: App, path: string): boolean {
	const normalized = normalizePath(path);
	const file = app.vault.getAbstractFileByPath(normalized);
	return file instanceof TFile;
}

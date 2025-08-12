import { App, Notice } from "obsidian";
import { createLogItem } from "./markdown-manager";

export async function warn(app: App, message: string,) {
	new Notice(message)
	console.warn(message)

	await createLogItem(app, message, '⚠️')
}

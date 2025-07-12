import { App } from "obsidian";

export async function createMarkdownWithJson(app: App, filePath: string, filename: string, data: string) {
	const content = "```json\n" + data + "\n```";
	await app.vault.create(`${filePath}/${filename}`, content);
}

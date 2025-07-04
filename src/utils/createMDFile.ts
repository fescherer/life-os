import { App } from "obsidian";

export async function createMarkdownWithJson(app: App, filePath: string, data: any) {
    const jsonString = JSON.stringify(data, null, 2);

    const content = "```json\n" + jsonString + "\n```";
    await app.vault.create(`${filePath}/entity.md`, content);
}
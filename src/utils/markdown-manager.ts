import { App, normalizePath, TFile, Vault } from "obsidian";

export function fileExists(app: App, path: string): boolean {
    const normalized = normalizePath(path);
    const file = app.vault.getAbstractFileByPath(normalized);
    return file instanceof TFile;
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

export async function writeMDFile(app: App, filePath: string, filename: string, data: string) {
    const content = "```json\n" + data + "\n```";
    await app.vault.create(`${filePath}/${filename}`, content);
}

export async function updateMDFile(
    vault: Vault,
    filePath: string,
    jsonString: string
): Promise<boolean> {
    const file = vault.getAbstractFileByPath(normalizePath(filePath));

    if (!(file instanceof TFile)) {
        console.warn(`File not found: ${filePath}`);
        return false;
    }

    const content = await vault.read(file);

    const updatedContent = content.replace(
        /````?json\s*([\s\S]*?)\s*````?/i,
        `\`\`\`json\n${jsonString}\n\`\`\``
    );

    if (updatedContent === content) {
        console.warn("No JSON block found to replace. Appending new JSON block.");
        await vault.modify(file, `${content.trim()}\n\n\`\`\`json\n${jsonString}\n\`\`\``);
        return true;
    }

    await vault.modify(file, updatedContent);
    return true;
}
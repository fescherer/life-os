import { TFile, Vault, normalizePath } from "obsidian";

export async function parseJsonFromMarkdownFile(vault: Vault, filePath: string): Promise<unknown | null> {
	// Normalize and get the file
	const file = vault.getAbstractFileByPath(normalizePath(filePath));

	if (!(file instanceof TFile)) {
		console.warn(`File not found: ${filePath}`);
		return null;
	}

	const content = await vault.read(file);

	// Extract the first JSON code block
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

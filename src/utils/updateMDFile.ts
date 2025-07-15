import { TFile, Vault, normalizePath } from "obsidian";

// this is overwriting, the correct is read the whole file and append it

export async function updateJsonInMarkdownFile(
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

	// If no match was found, we might want to insert it instead
	if (updatedContent === content) {
		console.warn("No JSON block found to replace. Appending new JSON block.");
		await vault.modify(file, `${content.trim()}\n\n\`\`\`json\n${jsonString}\n\`\`\``);
		return true;
	}

	await vault.modify(file, updatedContent);
	return true;
}

import { App, normalizePath, TAbstractFile, TFile } from "obsidian"
import { TEntity, TMarkdownField } from "src/types/field"

export function getMarkdownFieldName(field: TMarkdownField, entitySchema: TEntity, dataId: string): string {
    let prefix = ''
    if (field.prefixType == 'field') {
        const chosenField = entitySchema.fields.find(item => item.name == field.prefix)
        prefix = chosenField + '-'
    } else if (field.prefixType == 'text') {
        prefix = field.prefix + '-'
    } else {
        prefix = ''
    }

    return `md/${prefix}${entitySchema.entity}-${dataId}.md`;
}

export async function getMarkdownFieldFile(app: App, field: TMarkdownField, entitySchema: TEntity, dataId: string): Promise<TAbstractFile | null> {

    const filePath = getMarkdownFieldName(field, entitySchema, dataId)
    let file = app.vault.getAbstractFileByPath(normalizePath(filePath));

    if (!(file instanceof TFile)) {
        await app.vault.create(filePath, `# ${field.prefix}\n`);
        file = app.vault.getAbstractFileByPath(filePath);
    }

    return file
}
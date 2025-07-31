import { TEntity, TFileField } from "src/types/field"

export function getMarkdownFilePath(field: TFileField | TFileField, entitySchema: TEntity, dataItemId: string): string {
    let prefix = ''
    if (field.prefixType == 'field') {
        const chosenField = entitySchema.fields.find(item => item.name == field.prefix)
        prefix = chosenField?.name || ''
    } else if (field.prefixType == 'text') {
        prefix = field.prefix
    } else {
        prefix = entitySchema.entity
    }

    return `md/${prefix}-${dataItemId}-${field.id}.md`;
}
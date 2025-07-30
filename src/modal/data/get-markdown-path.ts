import { TEntity, TMarkdownField } from "src/types/field"

export function getMarkdownFilePath(field: TMarkdownField, entitySchema: TEntity, dataItemId: string): string {
    let prefix = ''
    if (field.prefixType == 'field') {
        const chosenField = entitySchema.fields.find(item => item.name == field.prefix)
        prefix = chosenField?.name + '-'
    } else if (field.prefixType == 'text') {
        prefix = field.prefix + '-'
    } else {
        prefix = ''
    }

    return `md/${prefix}${entitySchema.entity}-${dataItemId}.md`;
}
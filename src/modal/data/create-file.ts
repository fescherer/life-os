import { TDataItem } from "src/types/data"
import { TEntity, TFileField } from "src/types/field"
import { slugify } from "src/utils/slugify"

export function getMarkdownFilePath(field: TFileField | TFileField, entitySchema: TEntity, dataItem: TDataItem): string {
	let prefix = ''
	if (field.prefixType == 'field') {
		const chosenField = entitySchema.fields.find(item => item.name == field.prefix)
		prefix = chosenField?.name || ''
	} else if (field.prefixType == 'text') {
		prefix = field.prefix
	} else {
		prefix = slugify(dataItem.name)
	}
	console.log(`markdown ${prefix}`)

	return `md/${prefix}-${dataItem.id}-${field.id}.md`;
}

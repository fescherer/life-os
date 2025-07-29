export type TEntity = {
	entity: string
	label: string
	fields: Array<TField>
}

export type TTypeField = 'string' | 'number' | 'boolean' | 'date' | 'select' | 'url' | 'file' | 'array' | 'markdown'

export type TBaseField = {
	name: string
	label: string
	type: TTypeField
}

export interface TCommonField extends TBaseField {
	type: 'string' | 'boolean' | 'date' | 'url' | 'file' | 'array'
}

export interface TNumberField extends TBaseField {
	type: 'number'
	precision: number
}

export interface TSelectField extends TBaseField {
	type: 'select'
	options: Array<TOptionItem>
}

export type TPrefixField = 'no' | 'field' | 'text'

export interface TMarkdownField extends TBaseField {
	type: 'markdown'
	prefixType: TPrefixField
	prefix: string
}

export type TOptionItem = {
	id: string
	title: string
}

export type TField = TCommonField | TNumberField | TSelectField | TMarkdownField


export type TEntity = {
	entity: string
	label: string
	fields: Array<TField>
}

export type TTypeField = 'string' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect' | 'url' | 'file' | 'array' | 'conditional'

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

export interface TMultiSelectField extends TBaseField {
	type: 'multiselect'
	options: Array<TOptionItem>
}

export interface TConditionalField extends TBaseField {
	type: 'conditional'
	decimal: number
	basedOn: string
	cases: Record<string, TEntity>
}

export type TOptionItem = {
	id: string
	title: string
}

export type TField = TCommonField | TNumberField | TSelectField | TMultiSelectField | TConditionalField

export type TData = {
	entity: string
	label: string
	data: Array<Record<string, string | boolean | number | Array<string>>>
}

import { TField, TTypeField } from "src/types/field"

export function createBlankField(type: TTypeField): TField {
	switch (type) {
		case 'number':
			return {
				name: '',
				label: '',
				type,
				precision: 0,
			} as Extract<TField, { type: 'number' }>
		case 'select':
		case 'multiselect':
			return {
				name: '',
				label: '',
				type,
				options: [],
			} as Extract<TField, { type: 'select' | 'multiselect' }>
		case 'conditional':
			return {
				name: '',
				label: '',
				type,
				basedOn: '',
				cases: {}
			} as Extract<TField, { type: 'conditional' }>
		default:
			return {
				name: '',
				label: '',
				type,
			} as Extract<TField, { type: TTypeField }>
	}
}

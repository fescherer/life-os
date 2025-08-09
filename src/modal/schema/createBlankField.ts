import { TField, TTypeField } from "src/types/field"

export function createBlankField(type: TTypeField): TField {
	switch (type) {
		case 'number':
			return {
				name: '',
				label: '',
				type,
				precision: 0,
				id: 0,
			} as Extract<TField, { type: 'number' }>
		case 'select':
			return {
				name: '',
				label: '',
				type,
				options: [],
				id: 0,
			} as Extract<TField, { type: 'select' }>
		default:
			return {
				name: '',
				label: '',
				type,
				id: 0,
			} as Extract<TField, { type: TTypeField }>
	}
}

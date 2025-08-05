export type TData = {
	entity: string
	label: string
	idCount: number
	data: Array<TDataItem>
}

export type TDataItem = {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	[key: string]: string;
}

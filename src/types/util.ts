export type TValidate = {
	isValid: boolean
	missingFields: string[]
}

export type TLogType = '⚠️' | '❌' | '✅' | '📝'

export type TLog = {
	id: number,
	date: string,
	type: TLogType,
	message: string,

}

export interface TPluginSettings {
	currentFolderToView: string;
}

export const DEFAULT_SETTINGS: TPluginSettings = {
	currentFolderToView: ""
};

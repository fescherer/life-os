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
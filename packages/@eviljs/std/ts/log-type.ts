export enum LogType {
    Debug = 'debug',
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
}

export const LogTypes: Array<LogType> = Object.values(LogType)
export const LogTypesWithoutDebug: Array<LogType> = LogTypes.filter(it => it !== LogType.Debug)

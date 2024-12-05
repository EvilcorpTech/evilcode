import type {FnArgs} from './fn-type.js'
import {type Logger, LogKit} from './log-logger.js'
import {LogType, LogTypes} from './log-type.js'

export function consoleLogger(type: LogType, ...args: FnArgs): void {
    switch (type) {
        case LogType.Debug: return console.debug(...args)
        case LogType.Info: return console.info(...args)
        case LogType.Warn: return console.warn(...args)
        case LogType.Error: return console.error(...args)
    }
}

export function createConsoleLogger(options?: undefined | {
    filters?: undefined | Array<LogType>
}): Logger<LogType, void> {
    const filters = options?.filters ?? LogTypes

    function logger(type: LogType, ...args: FnArgs): void {
        return LogKit.log(consoleLogger, type, filters, ...args)
    }

    return logger
}

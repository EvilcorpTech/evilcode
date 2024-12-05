import type {FnArgs} from './fn-type.js'
import type {Logger} from './log-logger.js'
import {LogType} from './log-type.js'

export function createLoggerClient<R>(logger: Logger<LogType, R>): LoggerClient<LogType, R> {
    const self: LoggerClient<LogType, R> = {
        log: logger,

        debug(...args: FnArgs) {
            return self.log(LogType.Debug, ...args)
        },
        info(...args: FnArgs) {
            return self.log(LogType.Info, ...args)
        },
        warn(...args: FnArgs) {
            return self.log(LogType.Warn, ...args)
        },
        error(...args: FnArgs) {
            return self.log(LogType.Error, ...args)
        },
    }

    return self
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LoggerClient<T, R> {
    log: Logger<T, R>
    debug(...args: FnArgs): R
    info(...args: FnArgs): R
    warn(...args: FnArgs): R
    error(...args: FnArgs): R
}

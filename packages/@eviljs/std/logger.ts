import type {FnArgs} from './fn-type.js'
import type {ValueOf} from './type.js'

export const LogType = {
    Debug: 1 as const,
    Info: 2 as const,
    Warn: 3 as const,
    Error: 4 as const,
}

export const LogTypeDefault: 1 = LogType.Debug

export function createLogger<R>(log: (type: LogTypeEnum, ...args: FnArgs) => R): Logger<R> & LoggerProps {
    return {
        Type: LogType,

        log,

        debug(...args: FnArgs) {
            return log(LogType.Debug, ...args)
        },
        info(...args: FnArgs) {
            return log(LogType.Info, ...args)
        },
        warn(...args: FnArgs) {
            return log(LogType.Warn, ...args)
        },
        error(...args: FnArgs) {
            return log(LogType.Error, ...args)
        },
    }
}

export function createConsoleLog(options?: undefined | {
    console?: undefined | Logger<void>
    min?: undefined | LogTypeEnum
}): (type: LogTypeEnum, ...args: FnArgs) => void {
    const logger = options?.console ?? console
    const min = options?.min ?? LogTypeDefault

    function log(type: LogTypeEnum, ...args: FnArgs) {
        return logLevel(logger, type, min, ...args)
    }

    return log
}

export function logLevel<R>(
    adapter: Logger<R>,
    type: LogTypeEnum,
    min: LogTypeEnum,
    ...args: FnArgs
): void | R {
    return (type >= min)
        ? log(adapter, type, ...args)
        : undefined
}

export function log<R>(
    logger: Logger<R>,
    type: LogTypeEnum,
    ...args: FnArgs
): R {
    switch (type as undefined | typeof type) {
        case LogType.Debug:
            return logger.debug(...args)
        case LogType.Info:
            return logger.info(...args)
        case LogType.Warn:
            return logger.warn(...args)
        case LogType.Error:
            return logger.error(...args)
    }

    return logger.error(
        '@eviljs/std/logger.logOnAdapter(adapter, ~~type~~, ...args):\n'
        + `type must be ${Object.values(LogType).join(' | ')}, given "${type}".`
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Logger<R = void> {
    log(type: LogTypeEnum, ...args: FnArgs): R
    debug(...args: FnArgs): R
    info(...args: FnArgs): R
    warn(...args: FnArgs): R
    error(...args: FnArgs): R
}

export interface LoggerProps {
    Type: typeof LogType
}

export type LogTypeEnum = ValueOf<typeof LogType> & number

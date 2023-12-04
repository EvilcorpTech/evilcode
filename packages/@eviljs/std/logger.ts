export enum LogType {
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
}

export const LogTypeDefault = LogType.Debug

export function createLogger<R>(log: (type: LogType, ...args: Payload) => R): Logger<R> & LoggerProps {
    return {
        Type: LogType,

        log,

        debug(...args: Payload) {
            return log(LogType.Debug, ...args)
        },
        info(...args: Payload) {
            return log(LogType.Info, ...args)
        },
        warn(...args: Payload) {
            return log(LogType.Warn, ...args)
        },
        error(...args: Payload) {
            return log(LogType.Error, ...args)
        },
    }
}

export function createConsoleLog(options?: undefined | {
    console?: undefined | Logger<void>
    min?: undefined | LogType
}) {
    const logger = options?.console ?? console
    const min = options?.min ?? LogTypeDefault

    function log(type: LogType, ...args: Payload) {
        return logLevel(logger, type, min, ...args)
    }

    return log
}

export function logLevel<R>(
    adapter: Logger<R>,
    type: LogType,
    min: LogType,
    ...args: Payload
): void | R {
    return (type >= min)
        ? log(adapter, type, ...args)
        : undefined
}

export function log<R>(
    logger: Logger<R>,
    type: LogType,
    ...args: Payload
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
    log(type: LogType, ...args: Payload): R
    debug(...args: Payload): R
    info(...args: Payload): R
    warn(...args: Payload): R
    error(...args: Payload): R
}

export interface LoggerProps {
    Type: typeof LogType
}

export interface Payload extends Array<unknown> {
}

export enum LogType {
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
}

export const LogTypeDefault = LogType.Debug

export function createLogger<R>(log: (level: LogType, ...args: Payload) => R) {
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
    adapter?: undefined | Logger<void>
    levelMin?: undefined | LogType
}) {
    const adapter = options?.adapter ?? console
    const levelMin = options?.levelMin ?? LogTypeDefault

    function log(type: LogType, ...args: Payload) {
        return logLevelMinOn(adapter, levelMin, type, ...args)
    }

    return log
}

export function logLevelMinOn<R>(
    adapter: Logger<R>,
    levelMin: LogType,
    type: LogType,
    ...args: Payload
): void | R {
    return (type >= levelMin)
        ? logOnAdapter(adapter, type, ...args)
        : undefined
}

export function logOnAdapter<R>(
    adapter: Logger<R>,
    type: LogType,
    ...args: Payload
): R {
    switch (type) {
        case LogType.Debug:
            return adapter.debug(...args)
        break
        case LogType.Info:
            return adapter.info(...args)
        break
        case LogType.Warn:
            return adapter.warn(...args)
        break
        case LogType.Error:
            return adapter.error(...args)
        break
    }

    return adapter.error(
        '@eviljs/std/logger.logOnAdapter(adapter, ~~type~~, ...args):\n'
        + `type must be ${Object.values(LogType).join(' | ')}, given "${type}".`
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Logger<R> {
    log(type: LogType, ...args: Payload): R
    debug(...args: Payload): R
    info(...args: Payload): R
    warn(...args: Payload): R
    error(...args: Payload): R
}

export interface Payload extends Array<unknown> {
}

import {throwInvalidArgument} from './throw.js'
import {ValueOf} from './type.js'

export const Level = {
    Debug: 1,
    Info: 2,
    Warn: 3,
    Error: 4,
} as const

export const DefaultLevel = Level.Debug

export function LoggerService(container: LoggerContainer) {
    const {LoggerSpec: loggerSpec} = container
    const {Context: context} = container

    const spec = {
        adapter: loggerSpec?.adapter,
        level:
            context?.LOGGER_LEVEL
            ?? (process.env.LOGGER_LEVEL
                ? Number(process.env.LOGGER_LEVEL) as Level
                : void undefined
            )
            ?? loggerSpec?.level
        ,
    }

    return createLogger(spec)
}

export function createLogger(spec?: undefined | LoggerSpec) {
    const self: LoggerProxy = {
        adapter: spec?.adapter ?? console,
        level: spec?.level ?? DefaultLevel,
        Level,

        log(...args) {
            return logDefault(self, ...args)
        },
        debug(...args) {
            return logDebug(self, ...args)
        },
        info(...args) {
            return logInfo(self, ...args)
        },
        warn(...args) {
            return logWarn(self, ...args)
        },
        error(...args) {
            return logError(self, ...args)
        },
    }

    return self
}

export function logDefault(logger: LoggerProxy, level: Level, ...args: Array<unknown>) {
    switch (level) {
        case Level.Debug:
            return logger.debug(...args)
        case Level.Info:
            return logger.info(...args)
        case Level.Warn:
            return logger.warn(...args)
        case Level.Error:
            return logger.error(...args)
        default:
            return throwInvalidArgument(
                '@eviljs/std/logger.log(logger, ~~level~~, ...args):\n'
                + `level must be ${Object.values(Level).join(' | ')}, given "${level}".`
            )
    }
}

export function logDebug(logger: LoggerProxy, ...args: Array<unknown>) {
    if (logger.level > Level.Debug) {
        return logger
    }

    logger.adapter.debug(...args)

    return logger
}

export function logInfo(logger: LoggerProxy, ...args: Array<unknown>) {
    if (logger.level > Level.Info) {
        return logger
    }

    logger.adapter.info(...args)

    return logger
}

export function logWarn(logger: LoggerProxy, ...args: Array<unknown>) {
    if (logger.level > Level.Warn) {
        return logger
    }

    logger.adapter.warn(...args)

    return logger
}

export function logError(logger: LoggerProxy, ...args: Array<unknown>) {
    if (logger.level > Level.Error) {
        return logger
    }

    logger.adapter.error(...args)

    return logger
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LoggerContainer {
    Context?: undefined | {
        LOGGER_LEVEL: Level
    }
    LoggerSpec?: undefined | LoggerSpec
}

export interface LoggerStateless {
    log(level: Level, ...args: Array<unknown>): void
    debug(...args: Array<unknown>): void
    info(...args: Array<unknown>): void
    warn(...args: Array<unknown>): void
    error(...args: Array<unknown>): void
}

export interface Logger extends LoggerStateless {
    level: Level
    Level: typeof Level
}

export interface LoggerProxy extends Logger {
    adapter: LoggerStateless
}

export interface LoggerSpec {
    adapter?: undefined | LoggerStateless
    level?: undefined | Level
}

export type Level = ValueOf<typeof Level>

declare var process: {
    env: {
        [key: string]: string | undefined
    }
}

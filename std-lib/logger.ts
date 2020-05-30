import {throwInvalidArgument} from './error'
import {ValueOf} from './type'

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

export function createLogger(spec?: LoggerSpec) {
    const self: LoggerProxy = {
        adapter: spec?.adapter ?? console,
        level: spec?.level ?? DefaultLevel,
        Level,

        log(...args) {
            return log(self, ...args)
        },
        debug(...args) {
            return debug(self, ...args)
        },
        info(...args) {
            return info(self, ...args)
        },
        warn(...args) {
            return warn(self, ...args)
        },
        error(...args) {
            return error(self, ...args)
        },
    }

    return self
}

export function log(logger: LoggerProxy, level: Level, ...args: Array<unknown>) {
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
                '@eviljs/std-lib/logger.log(logger, ~~level~~, ...args):\n'
                + `level must be ${Object.values(Level).join(' | ')}, given "${level}".`
            )
    }
}

export function debug(logger: LoggerProxy, ...args: Array<unknown>) {
    if (logger.level > Level.Debug) {
        return logger
    }

    logger.adapter.debug(...args)

    return logger
}

export function info(logger: LoggerProxy, ...args: Array<unknown>) {
    if (logger.level > Level.Info) {
        return logger
    }

    logger.adapter.info(...args)

    return logger
}

export function warn(logger: LoggerProxy, ...args: Array<unknown>) {
    if (logger.level > Level.Warn) {
        return logger
    }

    logger.adapter.warn(...args)

    return logger
}

export function error(logger: LoggerProxy, ...args: Array<unknown>) {
    if (logger.level > Level.Error) {
        return logger
    }

    logger.adapter.error(...args)

    return logger
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LoggerContainer {
    Context?: {
        LOGGER_LEVEL: Level
    }
    LoggerSpec?: LoggerSpec
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
    adapter?: LoggerStateless
    level?: Level
}

export type Level = ValueOf<typeof Level>

declare var process: {
    env: {
        [key: string]: string | undefined
    }
}
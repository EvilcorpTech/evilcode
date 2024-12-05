import type {FnArgs} from './fn-type.js'

export const LogKit = {
    log<T, R>(
        logger: Logger<T, R>,
        type: T,
        filters: Array<T>,
        ...args: FnArgs
    ): undefined | R {
        if (! filters.includes(type)) {
            return
        }
        return logger(type, ...args)
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export type Logger<T, R> = (type: T, ...args: FnArgs) => R

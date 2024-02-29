import type {Io, Task} from './fn-type.js'

export function tryCatch<R, F>(fn: Task<R>, onError: Io<unknown, F>, onEnd?: undefined | Task): R | F {
    try {
        return fn()
    }
    catch (error) {
        return onError(error)
    }
    finally {
        onEnd?.()
    }
}

export function tryOrValue<R, F>(
    fn: Task<R>,
    fallback: F,
    onError?: undefined | Io<unknown, void>,
): R | F {
    return tryCatch(fn, error => {
        onError?.(error)
        return fallback
    })
}

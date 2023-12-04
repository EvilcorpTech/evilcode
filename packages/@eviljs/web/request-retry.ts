import {wait} from '@eviljs/std/async.js'
import type {Fn, Io} from '@eviljs/std/fn.js'

/**
* @throws
**/
export function usingFetchRetry(options?: undefined | FetchRetryOptions): Io<Request, Promise<Response>> {
    function continuation(request: Request): Promise<Response> {
        return useFetchRetry(request, options)
    }

    return continuation
}
/**
* @throws
**/
export function useFetchRetry(request: Request, options?: undefined | FetchRetryOptions): Promise<Response> {
    return fetch(request).catch(async (error) => {
        const times = (options?.times ?? 1)
        const delay = options?.delay ?? 0
        const onError = options?.onError ?? console.error

        if (times === 0) {
            throw error
        }

        onError(error)

        if (delay) {
            await wait(delay)
        }

        const delayFactor = options?.delayFactor ?? 0
        const delayMax = options?.delayMax ?? 30_000
        const nextDelay = delay && delayFactor
            ? Math.min(delayMax, delay * delayFactor)
            : undefined

        return useFetchRetry(request, {
            ...options,
            times: times - 1,
            delay: nextDelay,
        })
    })
}

// Types ///////////////////////////////////////////////////////////////////////

export interface FetchRetryOptions {
    times?: undefined | number
    delay?: undefined | number // In milliseconds.
    delayFactor?: undefined | number
    delayMax?: undefined | number // In milliseconds.
    onError?: undefined | Fn<[error: unknown], void>
}

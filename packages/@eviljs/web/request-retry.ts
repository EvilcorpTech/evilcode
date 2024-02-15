import {wait} from '@eviljs/std/async.js'
import {OneSecondInMs} from '@eviljs/std/date.js'
import type {Fn, Io} from '@eviljs/std/fn.js'
import {cloneRequestWithBody} from './request.js'
import {rejectOnResponseError} from './response.js'

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
    const executor = options?.fetch ?? fetch
    const check = options?.check ?? rejectOnResponseError
    const times = options?.times ?? 3
    const delay = options?.delay ?? OneSecondInMs
    const delayFactor = options?.delayFactor ?? 3
    const delayMax = options?.delayMax ?? 30_000
    const onError = options?.onError ?? console.error

    async function retry(error: unknown) {
        if (times === 0) {
            throw error
        }

        onError(error)

        await wait(delay)

        return useFetchRetry(request, {
            ...options,
            times: times - 1,
            delay: Math.min(delayMax, delay * delayFactor),
        })
    }

    // We need to clone the request otherwise a TypeError is raised due to used body.
    // `new Request(request)` does not work; we need `request.clone()`.
    return executor(cloneRequestWithBody(request)).then(check).catch(retry)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface FetchRetryOptions {
    fetch?: undefined | Io<Request, Promise<Response>>
    check?: undefined | Io<Response, Promise<Response>>
    delay?: undefined | number // In milliseconds.
    delayFactor?: undefined | number
    delayMax?: undefined | number // In milliseconds.
    onError?: undefined | Fn<[error: unknown], void>
    times?: undefined | number
}

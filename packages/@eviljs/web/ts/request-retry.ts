import {wait} from '@eviljs/std/async.js'
import {OneSecondInMs} from '@eviljs/std/date.js'
import type {Fn, Io} from '@eviljs/std/fn-type.js'
import {cloneRequestWithBody} from './request-clone.js'

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
    const assert = options?.assert ?? Promise.resolve<Response>
    const times = options?.times ?? 3
    const delay = options?.delay ?? OneSecondInMs
    const delayFactor = options?.delayFactor ?? 3
    const delayMax = options?.delayMax ?? 30_000
    const onError = options?.onError ?? console.error

    /**
    * @throws
    **/
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
    return executor(cloneRequestWithBody(request)).then(assert).catch(retry)
}

/**
* EXAMPLE
*
* const retryOptions: FetchRetryOptions = {
*     assert: rejectOnServerRecoverableStatus,
*     delay: 3_000,
*     delayFactor: 2,
*     times: 2,
* }
*/
export async function rejectOnServerRecoverableStatus(responsePromise: Response | Promise<Response>): Promise<Response> {
    const response = await responsePromise

    // Selects response errors eligible for retrying.
    switch (response.status) {
        case 408: // Request Timeout
        case 429: // Too Many Requests
        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
        case 507: // Insufficient Storage
            throw response
    }

    return response
}

// Types ///////////////////////////////////////////////////////////////////////

export interface FetchRetryOptions {
    /**
    * @throws
    **/
    assert?: undefined | Io<Response, Promise<Response>>
    delay?: undefined | number // In milliseconds.
    delayFactor?: undefined | number
    delayMax?: undefined | number // In milliseconds.
    fetch?: undefined | Io<Request, Promise<Response>>
    onError?: undefined | Fn<[error: unknown], void>
    times?: undefined | number
}

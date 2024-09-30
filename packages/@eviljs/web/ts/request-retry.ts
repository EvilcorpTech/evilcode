import {wait} from '@eviljs/std/async'
import {OneSecondInMs} from '@eviljs/std/date'
import type {Fn, Io} from '@eviljs/std/fn-type'
import {cloneRequestWithBody} from './request-clone.js'

/**
* @throws
**/
export function usingRequestRetry(options?: undefined | RequestRetryOptions): Io<Request, Promise<Response>> {
    function continuation(request: Request): Promise<Response> {
        return useRequestRetry(request, options)
    }

    return continuation
}
/**
* @throws
**/
export function useRequestRetry(request: Request, options?: undefined | RequestRetryOptions): Promise<Response> {
    const executor: Io<Request, Promise<Response>> = options?.executor ?? fetch
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

        return useRequestRetry(request, {
            ...options,
            times: times - 1,
            delay: Math.min(delayMax, delay * delayFactor),
        })
    }

    // We need to clone the request otherwise a TypeError is raised due to used body.
    // `new Request(request)` doesn't work; we need `request.clone()`.
    return executor(cloneRequestWithBody(request)).then(assert).catch(retry)
}

/**
* EXAMPLE
*
* const retryOptions: RequestRetryOptions = {
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

export interface RequestRetryOptions {
    /**
    * @throws
    **/
    assert?: undefined | Io<Response, Promise<Response>>
    delay?: undefined | number // In milliseconds.
    delayFactor?: undefined | number
    delayMax?: undefined | number // In milliseconds.
    executor?: undefined | Io<Request, Promise<Response>>
    onError?: undefined | Fn<[error: unknown], void>
    times?: undefined | number
}

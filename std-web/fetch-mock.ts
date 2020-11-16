import {createFetch, Fetch, FetchRequestMethod, FetchRequestOptions, JsonType} from './fetch.js'
import {error, StdError} from '@eviljs/std-lib/error.js'
import {randomInt} from '@eviljs/std-lib/random.js'
import {wait} from '@eviljs/std-lib/async.js'

export class MissingMock extends StdError {}

export const NoMock = Symbol('NoMock')

/*
* Mocks must be an object with the structure
*
* const mocks = {
*     'get': [
*         ['^/v1/hello$', (options?: FetchRequestOptions) =>
*             new Response(null, {status: 204})
*         ] as const,
*     ],
*     'post': [
*         ['^/v1/auth$', (options?: FetchRequestOptions) => {
*             const body = JSON.parse(options?.body as string)
*             if (body.identifier !== 'demo' || body.secret !== 'demo') {
*                 return new Response(null, {status: 404})
*             }
*             return new Response(JSON.stringify(data))
*         }] as const,
*     ],
* }
*/
export function mockFetch(fetch: Fetch, mocks: FetchMocks) {
    const self: Fetch = {
        ...createFetch({baseUrl: fetch.baseUrl}),

        request(...args) {
            const response = mockResponse(mocks, ...args)

            if (response !== NoMock) {
                return Promise.resolve(response)
            }

            const [method, path] = args
            console.debug(
                `@eviljs/std-web/fetch-mock.request():\n`
                + `missing mock for '${method.toUpperCase()} ${path}'.`
            )

            return fetch.request(...args)
        },
        get(...args) {
            return self.request('get', ...args)
        },
        post(...args) {
            return self.request('post', ...args)
        },
        put(...args) {
            return self.request('put', ...args)
        },
        delete(...args) {
            return self.request('delete', ...args)
        },
    }

    return self
}

export function mockFetchDelayed(fetch: Fetch, mocks: FetchMocks, opts?: MockFetchDelayedOptions) {
    const mockedFetch = mockFetch(fetch, mocks)
    const {request} = mockedFetch
    const minDelay = opts?.minDelay ?? 100 // 0.1 seconds.
    const maxDelay = opts?.maxDelay ?? 2000 // 2 seconds.

    // We replace the mocked Fetch.request() implementation with one simulating a slow network.
    mockedFetch.request = function (...args) {
        const delay = randomInt(minDelay, maxDelay)
        const promise = wait(delay).then(() =>
            // After have been waiting for a random time, we call the original API as is.
            request.apply(mockedFetch, args)
        )
        return promise
    }

    return mockedFetch
}

export function mockResponse(mocks: FetchMocks, type: FetchRequestMethod, path: string, options?: FetchRequestOptions) {
    const typeMocks = mocks[type]

    if (! typeMocks) {
        return NoMock
    }

    for (const mock of typeMocks) {
        const [re, response] = mock
        const regexp = new RegExp(re, 'i')

        if (! regexp.test(path)) {
            continue
        }

        return response(type, path, options)
    }

    return NoMock
}

export function jsonResponse(data: unknown, options?: FetchRequestOptions) {
    const body = JSON.stringify(data)
    const opts = {
        ...options,
        headers: {
            ...options?.headers,
            'Content-Type': JsonType,
        },
    }
    const response = new Response(body, opts)

    return response
}

// Types ///////////////////////////////////////////////////////////////////////

export type FetchMocks = {
    [key in FetchRequestMethod]?: FetchMethodMocks
}

export type FetchMethodMocks = Array<
    readonly [string, (type: FetchRequestMethod, path: string, options?: FetchRequestOptions) => Response]
>

export interface MockFetchDelayedOptions {
    minDelay?: number
    maxDelay?: number
}

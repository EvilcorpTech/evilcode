import {createFetch, Fetch, FetchRequestMethod, FetchRequestOptions, JsonType} from './fetch'
import {error, StdError} from '@eviljs/std-lib/error'
import {randomInt} from '@eviljs/std-lib/random'

export class MissingMock extends StdError {}

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
            try {
                const response = mockResponse(mocks, ...args)

                if (! response) {
                    const [method, path] = args
                    return throwMissingMock(method, path)
                }

                return Promise.resolve(response)
            }
            catch (error) {
                console.debug(error)

                return fetch.request(...args)
            }
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
        return
    }

    for (const mock of typeMocks) {
        const [re, response] = mock
        const regexp = new RegExp(re, 'i')

        if (regexp.test(path)) {
            return response(options)
        }
    }

    return
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

export function wait(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

export function throwMissingMock(method: string, path: string) {
    const message =
        `@eviljs/std-web/fetch-mock.mockFetch():\n`
        + `missing mock for '${method}:${path}'.`
    return error({type: MissingMock, message})
}

// Types ///////////////////////////////////////////////////////////////////////

export type FetchMocks = {
    [key in FetchRequestMethod]?: FetchMethodMocks
}

export type FetchMethodMocks = Array<
    readonly [string, (options?: FetchRequestOptions) => Response]
>

export interface MockFetchDelayedOptions {
    minDelay?: number
    maxDelay?: number
}

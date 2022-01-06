import {wait} from '@eviljs/std/async.js'
import {StdError} from '@eviljs/std/throw.js'
import {randomInt} from '@eviljs/std/random.js'
import {
    asJsonOptions,
    createFetch,
    Fetch,
    FetchRequestMethod,
    FetchRequestOptions,
    mergeOptions,
} from './fetch.js'
import {regexpFromPattern} from './route.js'

export class MissingMock extends StdError {}

export const NoMock = Symbol('NoMock')

/*
* Mocks must be an object with the structure:
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
                `@eviljs/web/fetch-mock.request():\n`
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

export function mockFetchDelayed(fetch: Fetch, mocks: FetchMocks, options?: MockFetchDelayedOptions) {
    const mockedFetch = mockFetch(fetch, mocks)
    const {request} = mockedFetch
    const minDelay = options?.minDelay ?? 100 // 0.1 seconds.
    const maxDelay = options?.maxDelay ?? 2000 // 2 seconds.

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

export function mockResponse(
    mocks: FetchMocks,
    type: FetchRequestMethod,
    path: string,
    options?: FetchRequestOptions,
) {
    const typeMocks = mocks[type.toLowerCase() as FetchRequestMethod]

    if (! typeMocks) {
        return NoMock
    }

    for (const mock of typeMocks) {
        const [pattern, responseFor] = mock
        const regexp = regexpFromPattern(pattern)

        if (! regexp.test(path)) {
            continue
        }

        return responseFor(type, path, options)
    }

    return NoMock
}

export function jsonResponse(data: unknown, options?: ResponseInit) {
    const jsonOptions = asJsonOptions(data)
    const responseOptions = mergeOptions(options ?? {}, jsonOptions)
    const body = responseOptions.body
    delete responseOptions.body
    const response = new Response(body, responseOptions)

    return response
}

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: API_URL})
* const mockedFetch = mockFetchDelayed(fetch, mocks, {minDelay: 500, maxDelay: 1000})
* createFetchServiceWorker(self, mockedFetch)
*/
export function createFetchServiceWorker(self: ServiceWorkerGlobalScope, fetch: Fetch) {
    const fetchUrl = fetch.baseUrl.startsWith('/')
        ? self.origin + fetch.baseUrl
        : fetch.baseUrl
    const fetchUrlInfo = new URL(fetchUrl)

    function log(...args: Array<any>) {
        console.debug('@eviljs/web/fetch-mock.createFetchServiceWorker():', ...args)
    }

    log('evaluating')

    self.addEventListener('install', (event) => {
        log('installing')
        self.skipWaiting()
    })

    self.addEventListener('activate', (event) => {
        log('activating')
        self.skipWaiting()
    })

    self.addEventListener('fetch', (event) => {
        const {request} = event
        const requestUrl = new URL(request.url)

        if (requestUrl.origin !== fetchUrlInfo.origin) {
            event.respondWith(self.fetch(request))
            return
        }
        if (! requestUrl.pathname.startsWith(fetchUrlInfo.pathname)) {
            event.respondWith(self.fetch(request))
            return
        }

        const method = request.method as FetchRequestMethod
        const url = requestUrl.href.replace(fetchUrlInfo.href, '')

        log(method, url)

        const promise = request.text().then((body => {
            const options = {...request, body}
            return fetch.request(method, url, options)
        }))

        event.respondWith(promise)
    })
}

export function asFetchMock(mocks: FetchMocks) {
    // Only for TypeScript typing purpose.
    return mocks
}

// Types ///////////////////////////////////////////////////////////////////////

export type FetchMocks = {
    [key in FetchRequestMethod]?: Array<[string, FetchMockHandler]>
}

export interface FetchMockHandler {
    (type: FetchRequestMethod, path: string, options?: FetchRequestOptions): Response
}

export interface MockFetchDelayedOptions {
    minDelay?: number
    maxDelay?: number
}

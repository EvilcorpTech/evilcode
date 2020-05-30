import {createFetch, Fetch, FetchRequestMethod, FetchRequestOptions, JsonType} from './fetch'

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
                    throw `@eviljs/std-web/fetch-mock.mockFetch(): missing mock for '${args[0]}:${args[1]}'`
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

// Types ///////////////////////////////////////////////////////////////////////

export type FetchMocks = {
    [key in FetchRequestMethod]?: FetchMethodMocks
}

export type FetchMethodMocks = Array<
    readonly [string, (options?: FetchRequestOptions) => Response]
>

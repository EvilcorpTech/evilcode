import { Fetch, FetchRequestOptions } from 'std-web/fetch'
import { mockFetch as mockStdFetch, jsonResponse } from 'std-web/fetch-mock'
import { times, randomInt } from 'std-lib/random'

export function mockFetch(fetch: Fetch) {
    return mockStdFetch(fetch, FetchMocks)
}

export const FetchMocks = {
    'get': [
        ['^/auth$', (options?: FetchRequestOptions) =>
            new Response(null, {status: 204})
        ] as const,
        ['^/data$', (options?: FetchRequestOptions) =>
            jsonResponse(createData())
        ] as const,
    ],
    'post': [
        ['^/auth$', (options?: FetchRequestOptions) => {
            const body = JSON.parse(options?.body as string)
            if (body.identifier !== 'demo' || body.secret !== 'demo') {
                return new Response(null, {status: 404})
            }
            return jsonResponse({token: 'abc1234567890'})
        }] as const,
    ],
}

export function createData() {
    return {
        items: times(10).map(idx => ({
            id: `id-${idx+1}`,
            name: `${idx+1}`,
            stat: randomInt(100, 1000),
        })).reduce(indexById, {}),
    }
}

export function indexBy(by: string, index: Dict, item: Dict) {
    // From Array to Object, indexed by a field.
    index[item[by]] = item

    return index
}

export function indexById(index: Dict, item: Dict) {
    return indexBy('id', index, item)
}

// Types ///////////////////////////////////////////////////////////////////////

type Dict = Record<string, any>
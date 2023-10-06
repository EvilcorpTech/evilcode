// import {times} from '@eviljs/std/iter'
// import {randomInt, randomItem, randomItems, randomTimes} from '@eviljs/std/random'
import type {FetchMocks} from '@eviljs/web/fetch-mock'
import {jsonResponse} from '@eviljs/web/fetch-mock'
import {exact} from '@eviljs/web/route'

export const FetchMocksSpec: FetchMocks = {
    'get': [
        [exact('/auth'), (type, path, options) =>
            new Response(null, {status: 204}) // 204 | 401
        ],
        [exact('/account/\\w+'), (type, path, options) =>
            jsonResponse({
                id: '123',
                firstName: 'Peter',
                lastName: 'Pan',
                avatar: 'https://www.tekoway.com/wp-content/uploads/2018/12/John-Doe.jpg',
            })
        ],
    ],
    'post': [
        [exact('/auth'), (type, path, options) => {
            const body = options?.body
                ? JSON.parse(options.body as string) as any
                : undefined

            if (! body || body.identifier === '' || body.secret === '') {
                return new Response(null, {status: 404})
            }
            return jsonResponse({token: 'abc1234567890'})
        }],
    ],
    'delete': [
        [exact('/auth'), (type, path, options) =>
            new Response(null, {status: 204})
        ],
    ],
}

// export function createExampleData(): ExampleDataResponse {
//     return {
//         data: times(200).map(idx => ({
//             id: `id-${idx+1}`,
//             name: `${idx+1}`,
//             value: randomInt(100, 1000),
//         })),
//     }
// }

import {JsonType} from '@eviljs/web/fetch'
import {Query, QueryRequestOptions} from '@eviljs/web/query'

export function createGraphql(fetch: Query) {
    function send(query: string, variables?: undefined | {}) {
        graphql(fetch, query, variables)
    }

    return send
}

export function graphql<R>(fetch: Query, query: string, variables?: undefined | {}) {
    const options: QueryRequestOptions = {
        headers: {
            'Content-Type': JsonType,
            'Accept': JsonType,
        },
        body: JSON.stringify({query, variables: variables ?? null}),
    }
    const promise = fetch.post<{data: R}>(fetch.baseUrl, options)
        .then(response => response.data)

    return promise
}

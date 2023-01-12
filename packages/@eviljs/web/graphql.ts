import {ContentType, HttpMethod} from './fetch.js'
import type {Fetch} from './fetch.js'
import {asBaseUrl} from './url.js'

export function createGraphql(fetch: Fetch) {
    function sendQuery<T>(query: string) {
        return sendGraphqlQuery<T>(fetch, query)
    }

    return sendQuery
}

export function sendGraphqlQuery<T = any>(fetch: Fetch, query: string): Promise<T> {
    const method = HttpMethod.Post
    const url = asBaseUrl(fetch.baseUrl)
    const conf = withRequestGraphql(query)

    return fetch.request(method, url, conf)
        .then(it => it.json())
        .then(it => it.data as T)
}

export function withRequestGraphql(query: string, variables?: undefined | {}): RequestInit {
    return {
        method: 'POST',
        headers: {
            'Accept': ContentType.Json,
            'Content-Type': ContentType.Json,
        },
        body: JSON.stringify({query, variables}),
    }
}

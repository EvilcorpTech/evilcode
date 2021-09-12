import {encodeParams, QueryRulesHeader, QueryParams, QueryRules} from '@eviljs/std/query.js'
import {Fetch, FetchRequestMethod, FetchRequestOptions, formatResponse} from './fetch.js'

export {throwInvalidResponse} from './throw.js'

export function createQuery(fetch: Fetch) {
    const self: Query = {
        baseUrl: fetch.baseUrl,

        request(...args) {
            return query(fetch, ...args)
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

    Object.defineProperty(self, 'baseUrl', {
        get() {
            return fetch.baseUrl
        },
    })

    return self
}

export async function query(fetch: Fetch, method: QueryRequestMethod, path: string, options?: undefined | QueryRequestOptions) {
    let requestArgs = [path, options] as const
    requestArgs = setupQueryParams(...requestArgs)
    requestArgs = setupQueryRules(...requestArgs)

    const response = await fetch.request(method, ...requestArgs)
    const content = await formatResponse(response)

    if (! response.ok) {
        throw [response.status, content] as QueryError
    }

    return content
}

export function setupQueryParams(path: string, options?: undefined | QueryRequestOptions) {
    const paramsString = encodeParams(options?.params)

    if (! paramsString) {
        return [path, options] as const
    }

    const sep = path.includes('?')
        ? '&'
        : '?'
    const pathWithParams = path + sep + paramsString

    return [pathWithParams, options] as const
}

export function setupQueryRules(path: string, options?: undefined | QueryRequestOptions) {
    const rules = options?.rules

    if (! rules) {
        return [path, options] as const
    }

    const newOptions = {
        ...options,
        headers: {
            ...options?.headers,
            [QueryRulesHeader]: JSON.stringify(rules),
        },
    }

    // const sep = path.includes('?')
    //     ? '&'
    //     : '?'
    // const encodedSelectors = encodeURIComponent(JSON.stringify(rules))
    // const path = `${path}${sep}@=${encodedSelectors}`
    // const query = [path] as const

    return [path, newOptions] as const
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Query {
    baseUrl: string
    request<T = unknown>(method: FetchRequestMethod, path: string, options?: undefined | QueryRequestOptions): Promise<T>
    get<T = unknown>(path: string, options?: undefined | QueryRequestOptions): Promise<T>
    post<T = unknown>(path: string, options?: undefined | QueryRequestOptions): Promise<T>
    put<T = unknown>(path: string, options?: undefined | QueryRequestOptions): Promise<T>
    delete<T = unknown>(path: string, options?: undefined | QueryRequestOptions): Promise<T>
}

export interface QueryRequestOptions extends FetchRequestOptions {
    params?: undefined | QueryParams
    rules?: undefined | QueryRules
}

export type QueryRequestMethod = FetchRequestMethod

export type QueryError<E = unknown> = [number, E]

import {assertObjectOptional} from '@eviljs/std-lib/assert.js'
import {ValueOf} from '@eviljs/std-lib/type.js'

export const FetchRequestMethod = {
    Get: 'get',
    Post: 'post',
    Put: 'put',
    Delete: 'delete',
} as const

export const JsonType = 'application/json'

export const ContentType = {
    Json: JsonType,
} as const

export function createFetch(options?: FetchOptions) {
    const self: Fetch = {
        baseUrl: options?.baseUrl ?? '',

        request(method: FetchRequestMethod, path: string, options?: FetchRequestOptions) {
            const url = path[0] === '/'
                ? `${self.baseUrl}${path}`
                : path
            const opts = mergeOptions(options ?? {}, {method})

            return fetch(url, opts)
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

export function mergeOptions(...optionsList: Array<FetchRequestOptions>) {
    const options = {} as Record<string, any>

    for (const optionsSource of optionsList) {
        assertObjectOptional(optionsSource.headers, 'options.headers')

        for (const prop in optionsSource) {
            switch (prop) {
                case 'headers':
                    options.headers = {
                        ...options.headers,
                        ...optionsSource.headers,
                    }
                break

                default:
                    options[prop] = optionsSource[prop as keyof typeof optionsSource]
                break
            }
        }
    }

    return options as FetchRequestOptions
}

export function asJson(body: unknown) {
    const options = {
        headers: {
            'Content-Type': JsonType,
        },
        body: body
            ? JSON.stringify(body)
            : void undefined
        ,
    }

    return options
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Fetch {
    baseUrl: string
    request(method: FetchRequestMethod, path: string, options?: FetchRequestOptions): ReturnType<typeof fetch>
    get(path: string, options?: FetchRequestOptions): ReturnType<typeof fetch>
    post(path: string, options?: FetchRequestOptions): ReturnType<typeof fetch>
    put(path: string, options?: FetchRequestOptions): ReturnType<typeof fetch>
    delete(path: string, options?: FetchRequestOptions): ReturnType<typeof fetch>
}

export interface FetchOptions {
    baseUrl?: string
}

export type FetchRequestMethod = ValueOf<typeof FetchRequestMethod>

export interface FetchRequestOptions extends RequestInit {
}

export type ContentType = ValueOf<typeof ContentType>

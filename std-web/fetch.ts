import {isObject, ValueOf} from '@eviljs/std-lib/type'
import {throwInvalidArgument} from '@eviljs/std-lib/error'

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
            const opts = mergeOptions(options || {}, {method})

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

export function mergeOptions(...options: Array<FetchRequestOptions>) {
    const mergedOptions = {} as Record<string, any>

    const simpleProps = [
        'body', 'cache', 'credentials', 'integrity', 'keepalive', 'method',
        'mode', 'redirect', 'referrer', 'referrerPolicy', 'signal', 'window',
    ] as const

    for (const opts of options) {
        for (const simpleProp of simpleProps) {
            if (simpleProp in opts) {
                const simpleValue = opts[simpleProp]
                mergedOptions[simpleProp] = simpleValue
            }
        }

        if (opts.headers) {
            if (! isObject(opts.headers)) {
                return throwInvalidArgument(
                    '@eviljs/std-web/fetch.mergeOptions(~~options~~):\n'
                    + `options[].headers must be an Object, given "${opts.headers}".`
                )
            }

            mergedOptions.headers = {
                ...mergedOptions.headers,
                ...opts.headers,
            }
        }
    }

    return mergedOptions as FetchRequestOptions
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

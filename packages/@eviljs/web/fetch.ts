import {isArray, isNil, isObject} from '@eviljs/std/type.js'
import {asBaseUrl} from './url.js'

export enum HttpMethod {
    Delete = 'delete',
    Get = 'get',
    Patch = 'patch',
    Post = 'post',
    Put = 'put',
}

export enum ContentType {
    Form = 'multipart/form-data',
    Json = 'application/json',
    Text = 'text/plain',
    Url = 'application/x-www-form-urlencoded',
}

export function createFetch(options?: undefined | FetchOptions) {
    const self: Fetch = {
        baseUrl: asBaseUrl(options?.baseUrl),

        /**
        * @throws
        */
        request(method: HttpMethod, path: string, options?: undefined | FetchRequestOptions) {
            const url = path.startsWith('/')
                ? `${self.baseUrl}${path}`
                : path
            const opts = mergeFetchOptions(options ?? {}, {method})

            return fetch(url, opts)
        },
        /**
        * @throws
        */
        get(...args) {
            return self.request(HttpMethod.Get, ...args)
        },
        /**
        * @throws
        */
        post(...args) {
            return self.request(HttpMethod.Post, ...args)
        },
        /**
        * @throws
        */
        put(...args) {
            return self.request(HttpMethod.Put, ...args)
        },
        /**
        * @throws
        */
        patch(...args) {
            return self.request(HttpMethod.Patch, ...args)
        },
        /**
        * @throws
        */
        delete(...args) {
            return self.request(HttpMethod.Delete, ...args)
        },
    }

    return self
}

export function mergeFetchOptions(...optionsList: Array<FetchRequestOptions>): FetchRequestOptions {
    const mergedOptions: FetchRequestOptions = {}
    const mergedOptionsHeaders: Record<string, string> = {}

    for (const options of optionsList) {
        for (const key in options) {
            const optionName = key as keyof typeof options

            switch (optionName) {
                case 'headers':
                    if (options.headers instanceof Headers) {
                        for (const it of options.headers.entries()) {
                            const [key, value] = it
                            mergedOptionsHeaders[key] = value
                        }
                    }
                    else if (isArray(options.headers)) {
                        for (const it of options.headers) {
                            const [key, value] = it as [string, string]
                            mergedOptionsHeaders[key] = value
                        }
                    }
                    else if (isObject(options.headers)) {
                        Object.assign(mergedOptionsHeaders, options.headers)
                    }
                    else if (isNil(options.headers)) {
                    }
                    else {
                        const message =
                            '@eviljs/web/fetch.mergeFetchOptions(...optionsList):\n'
                            + `headers must be Object | Array | Headers, given "${options.headers}".`
                        console.warn(message)
                    }
                break

                default:
                    mergedOptions[optionName] = options[optionName] as any
                break
            }
        }
    }

    return {...mergedOptions, headers: mergedOptionsHeaders}
}

export function withJsonOptions(body: unknown): FetchRequestOptions {
    return {
        headers: {
            'Content-Type': ContentType.Json,
        },
        body: body
            ? JSON.stringify(body)
            : null
        ,
    }
}

export function formatResponse(response: Response) {
    const type = response.headers.get('Content-Type')?.toLowerCase()

    if (! type) {
        return response.text()
    }
    if (type.startsWith(ContentType.Json)) {
        return response.json()
    }
    if (type.startsWith(ContentType.Form)) {
        return response.formData()
    }
    if (type.startsWith(ContentType.Url)) {
        return response.text().then(it => new URLSearchParams(it))
    }
    return response.text()
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Fetch {
    baseUrl: string
    request(method: HttpMethod, path: string, options?: undefined | FetchRequestOptions): ReturnType<typeof fetch>
    get(path: string, options?: undefined | FetchRequestOptions): ReturnType<typeof fetch>
    post(path: string, options?: undefined | FetchRequestOptions): ReturnType<typeof fetch>
    put(path: string, options?: undefined | FetchRequestOptions): ReturnType<typeof fetch>
    patch(path: string, options?: undefined | FetchRequestOptions): ReturnType<typeof fetch>
    delete(path: string, options?: undefined | FetchRequestOptions): ReturnType<typeof fetch>
}

export interface FetchOptions {
    baseUrl?: undefined | string
}

export interface FetchRequestOptions extends RequestInit {}

declare global {
    interface Headers {
        entries(): Array<[string, string]>
    }
}

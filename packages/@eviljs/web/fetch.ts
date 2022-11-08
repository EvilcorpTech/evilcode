import {isArray, isNil, isObject} from '@eviljs/std/type.js'
import {asBaseUrl} from './url.js'

export enum FetchRequestMethod {
    Get = 'get',
    Post = 'post',
    Put = 'put',
    Patch = 'patch',
    Delete = 'delete',
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
        request(method: FetchRequestMethod, path: string, options?: undefined | FetchRequestOptions) {
            const url = path.startsWith('/')
                ? `${self.baseUrl}${path}`
                : path
            const opts = mergeOptions(options ?? {}, {method})

            return fetch(url, opts)
        },
        /**
        * @throws
        */
        get(...args) {
            return self.request(FetchRequestMethod.Get, ...args)
        },
        /**
        * @throws
        */
        post(...args) {
            return self.request(FetchRequestMethod.Post, ...args)
        },
        /**
        * @throws
        */
        put(...args) {
            return self.request(FetchRequestMethod.Put, ...args)
        },
        /**
        * @throws
        */
        patch(...args) {
            return self.request(FetchRequestMethod.Patch, ...args)
        },
        /**
        * @throws
        */
        delete(...args) {
            return self.request(FetchRequestMethod.Delete, ...args)
        },
    }

    return self
}

export function mergeOptions(...optionsList: Array<FetchRequestOptions>): FetchRequestOptions {
    type Options = Omit<FetchRequestOptions, 'headers'> & {headers: Record<string, string>}
    const options: Options = {
        headers: {},
    }

    for (const optionsSource of optionsList) {
        for (const prop in optionsSource) {
            const optionName = prop as keyof FetchRequestOptions

            switch (optionName) {
                case 'headers':
                    if (optionsSource.headers instanceof Headers) {
                        for (const it of optionsSource.headers.entries()) {
                            const [key, value] = it
                            options.headers[key] = value
                        }
                    }
                    else if (isArray(optionsSource.headers)) {
                        for (const it of optionsSource.headers) {
                            const [key, value] = it as [string, string]
                            options.headers[key] = value
                        }
                    }
                    else if (isObject(optionsSource.headers)) {
                        options.headers = {
                            ...options.headers,
                            ...optionsSource.headers,
                        }
                    }
                    else if (isNil(optionsSource.headers)) {
                    }
                    else {
                        const message =
                            '@eviljs/web/fetch.mergeOptions(...optionsList):\n'
                            + `headers must be Object | Array | Headers, given "${optionsSource.headers}".`
                        console.warn(message)
                    }
                break

                default:
                    options[optionName] = optionsSource[optionName] as any
                break
            }
        }
    }

    return options
}

export function asJsonOptions(body: unknown): FetchRequestOptions {
    const options = {
        headers: {
            'Content-Type': ContentType.Json,
        },
        body: body
            ? JSON.stringify(body)
            : null
        ,
    }

    return options
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
    request(method: FetchRequestMethod, path: string, options?: undefined | FetchRequestOptions): ReturnType<typeof fetch>
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

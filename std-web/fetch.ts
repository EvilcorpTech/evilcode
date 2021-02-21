import {isArray, ValueOf} from '@eviljs/std-lib/type.js'

export const FetchRequestMethod = {
    Get: 'get',
    Post: 'post',
    Put: 'put',
    Delete: 'delete',
} as const

export const FormType = 'multipart/form-data'
export const JsonType = 'application/json'
export const TextType = 'text/plain'
export const UrlType = 'application/x-www-form-urlencoded'

export const ContentType = {
    Form: FormType,
    Json: JsonType,
    Text: TextType,
    Url: UrlType,
} as const

export function createFetch(options?: FetchOptions) {
    const self: Fetch = {
        baseUrl: asBaseUrl(options?.baseUrl),

        request(method: FetchRequestMethod, path: string, options?: FetchRequestOptions) {
            const url = path.startsWith('/')
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

export function asBaseUrl(url?: string) {
    if (! url) {
        return ''
    }
    if (! url.trim()) {
        return ''
    }
    if (url.endsWith('/')) {
        // Url, without the trailing slash.
        // It is fine to have a trailing slash but multiple trailing slashes
        // are ignored because are an error and should not be amended.
        return url.slice(0, -1)
    }
    return url
}

export function mergeOptions(...optionsList: Array<FetchRequestOptions>): FetchRequestOptions {
    type Options = Omit<FetchRequestOptions, 'headers'> & {headers: Record<string, string>}
    const options: Options = {headers: {}}

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
                    else {
                        options.headers = {
                            ...options.headers,
                            ...optionsSource.headers,
                        }
                    }
                break

                default:
                    options[optionName] = optionsSource[optionName]
                break
            }
        }
    }

    return options
}

export function asJsonOptions(body: unknown): FetchRequestOptions {
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

declare global {
    interface Headers {
        entries(): Array<[string, string]>
    }
}

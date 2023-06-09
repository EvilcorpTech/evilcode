import {throwInvalidArgument} from '@eviljs/std/throw.js'
import {isArray, isNil, isObject} from '@eviljs/std/type.js'
import {FormDataType, FormUrlType, JsonType, TextType} from './mimetype.js'
import {asBaseUrl, isUrlAbsolute, joinUrlPath} from './url.js'

export enum HttpMethod {
    Delete = 'delete',
    Get = 'get',
    Patch = 'patch',
    Post = 'post',
    Put = 'put',
}

export const ContentType = {
    FormData: FormDataType,
    FromUrl: FormUrlType,
    Json: JsonType,
    Text: TextType,
}

export function createFetch(options?: undefined | FetchOptions): Fetch {
    const self: Fetch = {
        baseUrl: asBaseUrl(options?.baseUrl),

        request(method: HttpMethod, path: string, optionsOptional?: undefined | FetchRequestOptions) {
            const url = isUrlAbsolute(path)
                ? path
                : joinUrlPath(self.baseUrl, path)
            const options = mergeFetchOptions(optionsOptional ?? {}, {method})

            return fetch(url, options)
        },
        get(...args) {
            return self.request(HttpMethod.Get, ...args)
        },
        post(...args) {
            return self.request(HttpMethod.Post, ...args)
        },
        put(...args) {
            return self.request(HttpMethod.Put, ...args)
        },
        patch(...args) {
            return self.request(HttpMethod.Patch, ...args)
        },
        delete(...args) {
            return self.request(HttpMethod.Delete, ...args)
        },
    }

    return self
}

/**
* @throws InvalidArgument
**/
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
                        return throwInvalidArgument(
                            '@eviljs/web/fetch.mergeFetchOptions(...optionsList):\n'
                            + `headers must be Object | Array | Headers, given "${options.headers}".`
                        )
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

export function unpackResponse(response: Response): Promise<string | FormData | URLSearchParams | unknown> {
    const type = response.headers.get('Content-Type')?.toLowerCase()

    if (! type) {
        return response.text()
    }
    if (type.startsWith(ContentType.Json)) {
        return response.json() as Promise<unknown>
    }
    if (type.startsWith(ContentType.FormData)) {
        return response.formData()
    }
    if (type.startsWith(ContentType.FromUrl)) {
        return response.text().then(it => new URLSearchParams(it))
    }
    return response.text()
}

/**
* @throws InvalidArgument
**/
export function withRequestHeaders(...headersList: Array<HeadersInit>): FetchRequestOptions {
    return mergeFetchOptions(...headersList.map(it => ({headers: it})))
}

export function withRequestJson(body: unknown): FetchRequestOptions {
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

// Types ///////////////////////////////////////////////////////////////////////

export interface Fetch extends FetchAttributes, FetchMethods {
}

export interface FetchAttributes {
    baseUrl: string
}

export interface FetchMethods {
    request(method: HttpMethod, path: string, options?: undefined | FetchRequestOptions): Promise<Response>
    get(path: string, options?: undefined | FetchRequestOptions): Promise<Response>
    post(path: string, options?: undefined | FetchRequestOptions): Promise<Response>
    put(path: string, options?: undefined | FetchRequestOptions): Promise<Response>
    patch(path: string, options?: undefined | FetchRequestOptions): Promise<Response>
    delete(path: string, options?: undefined | FetchRequestOptions): Promise<Response>
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

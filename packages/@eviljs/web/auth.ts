import {compute} from '@eviljs/std/compute.js'
import {isFunction, isObject} from '@eviljs/std/type.js'
import type {Fetch, FetchRequestOptions} from './fetch.js'
import {HttpMethod, mergeFetchOptions, withRequestJson} from './fetch.js'
import {throwInvalidResponse} from './throw.js'

export const AuthDefaultUrl = '/auth'
export const AuthDefaultOptions: FetchRequestOptions = {}

export async function authenticate(fetch: Fetch, credentials: AuthCredentials, options?: undefined | AuthenticateOptions) {
    const method = options?.method ?? HttpMethod.Post
    const url = createUrl(options?.url, credentials)
    const createRequestBody = options?.requestBody ?? defaultCreateRequestBody
    const extractResponseError = options?.responseError ?? defaultExtractResponseError
    const extractResponseToken = options?.responseToken ?? defaultExtractResponseToken
    const body = createRequestBody(credentials)
    const baseOpts = createOptions(options?.options, credentials)
    const bodyOpts = withRequestJson(body)
    const opts = mergeFetchOptions(baseOpts, bodyOpts)

    const response = await fetch.request(method, url, opts)

    const responseBody = await (async () => {
        try {
            return await response.json() as AuthCredentialsResponse
        }
        catch (error) {
            return throwInvalidResponseWithReason('authenticate',
                invalidResponseContentReason()
            )
        }
    })()

    if (! isObject(responseBody)) {
        return throwInvalidResponseWithReason('authenticate',
            invalidResponseContentReason()
        )
    }

    if (! response.ok) {
        return throwInvalidResponseWithReason('authenticate',
            extractResponseError(responseBody) ?? 'bad_authenticate_without_known_error'
        )
    }

    if (response.ok) {
        const token = extractResponseToken(responseBody)

        if (! token) {
            return throwInvalidResponseWithReason('authenticate',
                invalidResponseTokenReason(responseBody)
            )
        }

        return token
    }

    return throwInvalidResponseWithReason('authenticate',
        invalidResponseStatusReason(response)
    )
}

export async function validate(fetch: Fetch, token: string, options?: undefined | ValidateOptions) {
    const method = options?.method ?? HttpMethod.Get
    const url = createUrl(options?.url, token)
    const opts = createOptions(options?.options, token)

    const response = await fetch.request(method, url, opts)

    return response.ok
}

export async function invalidate(fetch: Fetch, token: string, options?: undefined | InvalidateOptions) {
    const method = options?.method ?? HttpMethod.Delete
    const url = createUrl(options?.url, token)
    const opts = createOptions(options?.options, token)

    const response = await fetch.request(method, url, opts)

    if (! response.ok) {
        return throwInvalidResponseWithReason('invalidate',
            invalidResponseStatusReason(response)
        )
    }

    return response.ok
}

export function createUrl<A extends Array<unknown>>(url: undefined | FetchOptionGetter<A, string>, ...args: A) {
    return compute(url, ...args) ?? AuthDefaultUrl
}

export function createOptions<A extends Array<unknown>>(
    options: undefined | FetchOptionGetter<A, FetchRequestOptions>,
    ...args: A
) {
    return isFunction(options)
        ? options(...args)
        : (options ?? AuthDefaultOptions)
}

export function defaultCreateRequestBody(credentials: AuthCredentials) {
    return {
        identifier: credentials.identifier,
        secret: credentials.secret,
    }
}

export function defaultExtractResponseError(body: AuthCredentialsResponse) {
    return body.error
}

export function defaultExtractResponseToken(body: AuthCredentialsResponse) {
    return body.token
}

export function throwInvalidResponseWithReason(funcName: string, reason: string) {
    return throwInvalidResponse(
        `@eviljs/web/auth.${funcName}() -> ~~Response~~:\n`
        + reason
    )
}

export function invalidResponseTokenReason(responseBody: any) {
    return `Response must contain a token inside the JSON body, given "${responseBody}".`
}

export function invalidResponseStatusReason(response: Response) {
    return `Response must have a 2xx status, given "${response.status}" (${response.statusText}).`
}

export function invalidResponseContentReason() {
    return 'Response must have a well formed JSON content.'
}

// Types ///////////////////////////////////////////////////////////////////////

export interface FetchOptions<A extends Array<unknown>> {
    url?: undefined | FetchOptionGetter<A, string>
    method?: undefined | HttpMethod
    options?: undefined | FetchOptionGetter<A, FetchRequestOptions>
}

export interface AuthenticateOptions extends FetchOptions<[AuthCredentials]> {
    requestBody?: undefined | ((credentials: AuthCredentials) => unknown)
    responseError?: undefined | ((body: unknown) => string | undefined)
    responseToken?: undefined | ((body: unknown) => string | undefined)
}

export interface ValidateOptions extends FetchOptions<[string]> {
}

export interface InvalidateOptions extends FetchOptions<[string]> {
}

export interface AuthCredentials {
    identifier: string
    secret: string
}

export interface AuthCredentialsResponse {
    error?: undefined | string
    token?: undefined | string
}

export type FetchOptionGetter<A extends Array<unknown>, R> =
    | R
    | ((...args: A) => R)

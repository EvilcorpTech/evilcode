import {asJsonOptions, Fetch, FetchRequestMethod, mergeOptions, FetchRequestOptions} from './fetch.js'
import {isFunction, isObject} from '@eviljs/std-lib/type.js'
import {throwInvalidResponse} from './error.js'

export const DefaultUrl = '/auth'
export const DefaultOptions: FetchRequestOptions = {}

export async function authenticate(fetch: Fetch, credentials: AuthCredentials, options?: AuthenticateOptions) {
    const method = options?.method ?? 'post'
    const url = createUrl(options?.url, credentials)
    const createRequestBody = options?.requestBody ?? defaultCreateRequestBody
    const extractResponseError = options?.responseError ?? defaultExtractResponseError
    const extractResponseToken = options?.responseToken ?? defaultExtractResponseToken
    const body = createRequestBody(credentials)
    const baseOpts = createOptions(options?.options, credentials)
    const bodyOpts = asJsonOptions(body)
    const opts = mergeOptions(baseOpts, bodyOpts)

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

export async function validate(fetch: Fetch, token: string, options?: ValidateOptions) {
    const method = options?.method ?? 'get'
    const url = createUrl(options?.url, token)
    const opts = createOptions(options?.options, token)

    const response = await fetch.request(method, url, opts)

    return response.ok
}

export async function invalidate(fetch: Fetch, token: string, options?: InvalidateOptions) {
    const method = options?.method ?? 'delete'
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

export function createUrl<A extends Args>(url: undefined | FetchOptionGetter<A, string>, ...args: A) {
    return isFunction(url)
        ? url(...args)
        : (url ?? DefaultUrl)
}

export function createOptions<A extends Args>(options: undefined | FetchOptionGetter<A, FetchRequestOptions>, ...args: A) {
    return isFunction(options)
        ? options(...args)
        : (options ?? DefaultOptions)
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
        `@eviljs/std-web/auth.${funcName}() -> ~~Response~~:\n`
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

export interface Args extends Array<unknown> {
}

export interface FetchOptions<A extends Args> {
    url?: FetchOptionGetter<A, string>
    method?: FetchRequestMethod
    options?: FetchOptionGetter<A, FetchRequestOptions>
}

export interface AuthenticateOptions extends FetchOptions<[AuthCredentials]> {
    requestBody?(credentials: AuthCredentials): any
    responseError?(body: any): string | undefined
    responseToken?(body: any): string | undefined
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
    error?: string
    token?: string
}

export type FetchOptionGetter<A extends Args, R> =
    | R
    | ((...args: A) => R)

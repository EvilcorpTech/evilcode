import {compute, type Computable} from '@eviljs/std/compute.js'
import type {FnArgs} from '@eviljs/std/fn.js'
import {isObject} from '@eviljs/std/type.js'
import type {Fetch, FetchRequestOptions} from './fetch.js'
import {HttpMethod, mergeFetchOptions, withRequestJson} from './fetch.js'
import {throwInvalidResponse} from './throw.js'

export const AuthDefaultUrl = '/auth'
export const AuthDefaultFetchOptions: FetchRequestOptions = {}

export async function authenticate(fetch: Fetch, credentials: AuthCredentials, options?: undefined | AuthAuthenticateOptions) {
    const method = options?.method ?? HttpMethod.Post
    const url = compute(options?.url, credentials) ?? AuthDefaultUrl
    const createRequestBody = options?.requestBody ?? defaultCreateRequestBody
    const extractResponseError = options?.responseError ?? defaultExtractResponseError
    const extractResponseToken = options?.responseToken ?? defaultExtractResponseToken
    const fetchOptions = mergeFetchOptions(
        compute(options?.options, credentials) ?? AuthDefaultFetchOptions,
        withRequestJson(createRequestBody(credentials)),
    )

    const response = await fetch.request(method, url, fetchOptions)

    const responseBody = await (async () => {
        try {
            return await response.json() as AuthCredentialsResponse
        }
        catch (error) {
            return throwAuthInvalidResponse('authenticate', AuthMessages.invalidResponseContent())
        }
    })()

    if (! isObject(responseBody)) {
        return throwAuthInvalidResponse('authenticate', AuthMessages.invalidResponseContent())
    }

    if (! response.ok) {
        return throwAuthInvalidResponse('authenticate',
            extractResponseError(responseBody) ?? 'bad_authenticate_without_known_error'
        )
    }

    if (response.ok) {
        const token = extractResponseToken(responseBody)

        if (! token) {
            return throwAuthInvalidResponse('authenticate', AuthMessages.invalidResponseToken(responseBody))
        }

        return token
    }

    return throwAuthInvalidResponse('authenticate', AuthMessages.invalidResponseStatus(response))
}

export async function validateAuthentication(fetch: Fetch, token: string, options?: undefined | AuthValidateOptions) {
    const method = options?.method ?? HttpMethod.Get
    const url = compute(options?.url, token) ?? AuthDefaultUrl
    const opts = compute(options?.options, token)

    const response = await fetch.request(method, url, opts)

    return response.ok
}

export async function invalidateAuthentication(fetch: Fetch, token: string, options?: undefined | AuthInvalidateOptions) {
    const method = options?.method ?? HttpMethod.Delete
    const url = compute(options?.url, token) ?? AuthDefaultUrl
    const opts = compute(options?.options, token)

    const response = await fetch.request(method, url, opts)

    if (! response.ok) {
        return throwAuthInvalidResponse('invalidateAuthentication', AuthMessages.invalidResponseStatus(response))
    }

    return response.ok
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

export function throwAuthInvalidResponse(funcName: string, reason: string) {
    return throwInvalidResponse(
        `@eviljs/web/auth.${funcName}() -> ~~Response~~:\n`
        + reason
    )
}

export const AuthMessages = {
    invalidResponseToken(responseBody: any) {
        return `Response must contain a token inside the JSON body, given "${responseBody}".`
    },
    invalidResponseStatus(response: Response) {
        return `Response must have a 2xx status, given "${response.status}" (${response.statusText}).`
    },
    invalidResponseContent() {
        return 'Response must have a well formed JSON content.'
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthFetchOptions<A extends FnArgs> {
    url?: undefined | Computable<string, A>
    method?: undefined | HttpMethod
    options?: undefined | Computable<FetchRequestOptions, A>
}

export interface AuthAuthenticateOptions extends AuthFetchOptions<[AuthCredentials]> {
    requestBody?: undefined | ((credentials: AuthCredentials) => unknown)
    responseError?: undefined | ((body: unknown) => undefined | string)
    responseToken?: undefined | ((body: unknown) => undefined | string)
}

export interface AuthValidateOptions extends AuthFetchOptions<[token: string]> {
}

export interface AuthInvalidateOptions extends AuthFetchOptions<[token: string]> {
}

export interface AuthCredentials {
    identifier: string
    secret: string
}

export interface AuthCredentialsResponse {
    error?: undefined | string
    token?: undefined | string
}

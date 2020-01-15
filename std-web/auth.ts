import { asJson, Fetch, FetchRequestMethod } from './fetch'
import { isObject } from '@eviljs/std-lib/type'
import { throwInvalidResponse } from './error'

export const DefaultUrl = '/auth'

export async function authenticate(fetch: Fetch, credentials: AuthCredentials, options?: FetchOptions) {
    const method = options?.method ?? 'post'
    const url = options?.url ?? DefaultUrl
    const body = {
        identifier: credentials.identifier,
        secret: credentials.secret,
    }
    const opts = asJson(body)

    const response = await fetch.request(method, url, opts)

    let result
    try {
        result = await response.json() as AuthCredentialsResponse
    }
    catch (error) {
        return throwInvalidResponseWithReason('authenticate',
            invalidResponseContentReason()
        )
    }

    if (! isObject(result)) {
        return throwInvalidResponseWithReason('authenticate',
            invalidResponseContentReason()
        )
    }

    if (! response.ok && result.error) {
        throw result.error
    }

    if (response.ok && result.token) {
        return result.token as string
    }

    return throwInvalidResponseWithReason('authenticate',
        invalidResponseStatusReason(response)
    )
}

export async function validate(fetch: Fetch, token: string, options?: FetchOptions) {
    const method = options?.method ?? 'get'
    const url = options?.url ?? DefaultUrl

    const response = await fetch.request(method, url)

    return response.ok
}

export async function invalidate(fetch: Fetch, token: string, options?: FetchOptions) {
    const method = options?.method ?? 'delete'
    const url = options?.url ?? DefaultUrl

    const response = await fetch.request(method, url)

    if (! response.ok) {
        return throwInvalidResponseWithReason('invalidate',
            invalidResponseStatusReason(response)
        )
    }

    return response.ok
}

export function throwInvalidResponseWithReason(funcName: string, reason: string) {
    return throwInvalidResponse(
        `@eviljs/std-web/auth.${funcName}() -> ~~Response~~:\n`
        + reason
    )
}

export function invalidResponseStatusReason(response: Response) {
    return `Response must have a 2xx status, given "${response.status}" (${response.statusText}).`
}

export function invalidResponseContentReason() {
    return 'Response must have a well formed JSON content.'
}

// Types ///////////////////////////////////////////////////////////////////////

export interface FetchOptions {
    url?: string
    method?: FetchRequestMethod
}

export interface AuthCredentials {
    identifier: string
    secret: string
}

export interface AuthCredentialsResponse {
    error?: string
    token?: string
}
import {isSome} from '@eviljs/std/type'
import type {FetchRequestOptions} from '@eviljs/web/fetch'
import {withRequestHeaders, withRequestJson} from '@eviljs/web/fetch'
import {mergeQueryOptions} from '@eviljs/web/query'

export {mergeFetchOptions, withRequestHeaders, withRequestJson} from '@eviljs/web/fetch'
export {mergeQueryOptions, withQueryParams} from '@eviljs/web/query'
export type {Query, QueryRequestOptions} from '@eviljs/web/query'

export function withRequestAuth(token: string): FetchRequestOptions {
    return withRequestHeaders({
        Authorization: `Bearer ${token}`,
    })
}

export function withRequestCaptcha(token: string): FetchRequestOptions {
    return withRequestHeaders({
        'X-Recaptcha-Token': token,
    })
}

export function withRequestPayload(options: PayloadOptions): FetchRequestOptions {
    const {authToken, jsonBody} = options

    const optionsList = [
        authToken ? withRequestAuth(authToken) : undefined,
        jsonBody ? withRequestJson(jsonBody) : undefined,
    ].filter(isSome)

    return mergeQueryOptions(...optionsList)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PayloadOptions<JsonBody = unknown> {
    authToken?: string
    jsonBody: JsonBody
}

export interface PayloadAndAuthOptions<JsonBody = unknown> {
    authToken: string
    jsonBody: JsonBody
}

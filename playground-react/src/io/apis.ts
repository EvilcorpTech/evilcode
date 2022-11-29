import {isNotNil} from '@eviljs/std/type'
import type {FetchRequestOptions} from '@eviljs/web/fetch'
import {withRequestJson} from '@eviljs/web/fetch'
import type {QueryParams, QueryRequestOptions} from '@eviljs/web/query'
import {mergeQueryOptions} from '@eviljs/web/query'

export {withRequestJson} from '@eviljs/web/fetch'
export {mergeQueryOptions} from '@eviljs/web/query'
export type {Query, QueryRequestOptions} from '@eviljs/web/query'

export function withRequestHeaders(...headersList: Array<NonNullable<QueryRequestOptions['headers']>>): FetchRequestOptions {
    return mergeQueryOptions(...headersList.map(it => ({headers: it})))
}

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
    ].filter(isNotNil)

    return mergeQueryOptions(...optionsList)
}

export function withQueryParams(params: QueryParams): QueryRequestOptions {
    return {params}
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

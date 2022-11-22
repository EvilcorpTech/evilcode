import {withJsonOptions} from '@eviljs/web/fetch'
import type {QueryRequestOptions} from '@eviljs/web/query'
import {mergeQueryOptions} from '@eviljs/web/query'

export function withAuthOptions(token: string): QueryRequestOptions {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
}

export function withPayloadOptions(options: PayloadOptions) {
    const {authToken, jsonBody} = options

    const optionsList = [
        authToken ? withAuthOptions(authToken) : null,
        jsonBody ? withJsonOptions(jsonBody) : null,
    ].filter(Boolean) as Array<QueryRequestOptions>

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

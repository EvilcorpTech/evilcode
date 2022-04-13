import {asJsonOptions, mergeOptions} from '@eviljs/web/fetch'
import {QueryRequestOptions} from '@eviljs/web/query'

export function asAuthOptions(token: string): QueryRequestOptions {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
}

export function asPayloadOptions(options: PayloadOptions) {
    const {authToken, jsonBody} = options

    const optionsList = [
        authToken ? asAuthOptions(authToken) : null,
        jsonBody ? asJsonOptions(jsonBody) : null,
    ].filter(Boolean) as Array<QueryRequestOptions>

    return mergeOptions(...optionsList)
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

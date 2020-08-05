import {PromiseOf} from '@eviljs/std-lib/type'
import {Query, QueryRequestOptions} from '@eviljs/std-web/query'

export async function queryAccount(query: Query, token: string, options?: QueryRequestOptions) {
    return await query.get<AccountResponse>(`/account/${token}`, options)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AccountResponse {
    id: string
    firstName: string
    lastName: string
    avatar: string
}

export type AccountModel = PromiseOf<ReturnType<typeof queryAccount>>

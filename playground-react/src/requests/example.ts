import {Query} from '@eviljs/web/query'
import {asAuthOptions} from '../kit/auth'
import {DateString, IdString, UrlString} from '../models/types'

export async function readAccount(query: Query, token: string): Promise<AccountModel> {
    const options = asAuthOptions(token)

    const response = await query.get<AccountResponse>('/account', options)

    return {
        ...response,
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AccountResponse {
    id: IdString
    createdAt: DateString
    identifier: string
    firstName: string
    lastName: string
    avatar: UrlString
}

export interface AccountModel {
    id: IdString
    createdAt: DateString
    identifier: string
    firstName: string
    lastName: string
    avatar: UrlString
}

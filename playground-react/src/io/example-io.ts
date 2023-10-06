import {asDate, type Unsafe} from '@eviljs/std/type'
import type {Query} from '@eviljs/web/query'
import {withRequestAuth} from '~/io/io-apis'
import type {DateString, IdString, UrlString} from '~/type/type-apis'

export async function readAccount(query: Query, token: string): Promise<ReadAccountRequest['Output']> {
    const options = withRequestAuth(token)

    const response = await query.get<ReadAccountRequest['Response']>('/account', options)

    return decodeAccountResponse(response)
}

// Codecs //////////////////////////////////////////////////////////////////////

export function decodeAccountResponse(response: ReadAccountRequest['Response']): ReadAccountRequest['Output'] {
    return {
        id: response?.id ?? '',
        createdAt: asDate(response?.createdAt) ?? new Date(0),
        identifier: response?.identifier ?? '',
        firstName: response?.firstName ?? '',
        lastName: response?.lastName ?? '',
        avatar: response?.avatar ?? '',
    }
}

export interface ReadAccountRequest {
    Response: Unsafe<{
        id: IdString
        createdAt: DateString
        identifier: string
        firstName: string
        lastName: string
        avatar: UrlString
    }>
    Output: {
        id: NonNullable<NonNullable<ReadAccountRequest['Response']>['id']>
        createdAt: Date
        identifier: NonNullable<NonNullable<ReadAccountRequest['Response']>['identifier']>
        firstName: NonNullable<NonNullable<ReadAccountRequest['Response']>['firstName']>
        lastName: NonNullable<NonNullable<ReadAccountRequest['Response']>['lastName']>
        avatar: NonNullable<NonNullable<ReadAccountRequest['Response']>['avatar']>
    }
}

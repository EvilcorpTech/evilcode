import type {Unsafe} from '@eviljs/std/type'
import type {Query} from '@eviljs/web/query'
import {withRequestAuth} from '~/io/apis'
import type {DateString, IdString, UrlString} from '~/type/type-apis'

export async function readAccount(query: Query, token: string): Promise<ReadAccountOutput> {
    const options = withRequestAuth(token)

    const response = await query.get<ReadAccountResponse>('/account', options)

    return decodeAccountResponse(response)
}

// Codecs //////////////////////////////////////////////////////////////////////

export function decodeAccountResponse(response: ReadAccountResponse): ReadAccountOutput {
    return {
        ...response,
    }
}

export interface ReadAccountResponse extends NonNullable<Unsafe<{
    id: IdString
    createdAt: DateString
    identifier: string
    firstName: string
    lastName: string
    avatar: UrlString
}>> {}

export interface ReadAccountOutput extends ReadAccountResponse {
}

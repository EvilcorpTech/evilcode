import type {Query} from '@eviljs/web/query'
import {asAuthOptions} from '~/io/apis'
import {mapAccountResponse} from './codecs'
import type {ReadAccountOutput} from './outputs'
import type {ReadAccountResponse} from './responses'

export async function readAccount(query: Query, token: string): Promise<ReadAccountOutput> {
    const options = asAuthOptions(token)

    const response = await query.get<ReadAccountResponse>('/account', options)

    return mapAccountResponse(response)
}

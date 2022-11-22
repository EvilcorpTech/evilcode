import type {Query} from '@eviljs/web/query'
import {withAuthOptions} from '~/io/apis'
import {mapAccountResponse} from './codecs'
import type {ReadAccountOutput} from './outputs'
import type {ReadAccountResponse} from './responses'

export async function readAccount(query: Query, token: string): Promise<ReadAccountOutput> {
    const options = withAuthOptions(token)

    const response = await query.get<ReadAccountResponse>('/account', options)

    return mapAccountResponse(response)
}

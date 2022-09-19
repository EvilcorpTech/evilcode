import type {Query} from '@eviljs/web/query'
import {asAuthOptions} from '../kit/auth'
import type {ReadAccountOutput} from './example.output'
import type {ReadAccountResponse} from './example.response'

export async function readAccount(query: Query, token: string): Promise<ReadAccountOutput> {
    const options = asAuthOptions(token)

    const response = await query.get<ReadAccountResponse>('/account', options)

    return {
        ...response,
    }
}

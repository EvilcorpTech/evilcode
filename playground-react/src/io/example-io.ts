import {awaiting} from '@eviljs/std/fn'
import {asDate, type Unsafe} from '@eviljs/std/type'
import {usingRequestAuthorization} from '@eviljs/web/request-auth'
import {creatingRequestGet} from '@eviljs/web/request-method'
import {decodeResponseBodyAsJson} from '@eviljs/web/response'
import {Env} from '~/env/env-specs'
import type {DateString, IdString, UrlString} from '~/type/type-apis'

export async function readAccount(token: string): Promise<ReadAccountIoOutput> {
    return creatingRequestGet('/account', {baseUrl: Env.ApiUrl})
        (usingRequestAuthorization('Bearer', token))
        (fetch)
        (decodeResponseBodyAsJson<ReadAccountIoResponse>)
        (awaiting(ReadAccountIoCodec.decodeResponse))
    ()
}

// Codecs //////////////////////////////////////////////////////////////////////

export const ReadAccountIoCodec = {
    decodeResponse(response: ReadAccountIoResponse): ReadAccountIoOutput {
        return {
            id: response?.id ?? '',
            createdAt: asDate(response?.createdAt) ?? new Date(0),
            identifier: response?.identifier ?? '',
            firstName: response?.firstName ?? '',
            lastName: response?.lastName ?? '',
            avatar: response?.avatar ?? '',
        }
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReadAccountIo {
    Response: ReadAccountIoResponse
    Output: ReadAccountIoOutput
}

export type ReadAccountIoResponse = Unsafe<{
    id: IdString
    createdAt: DateString
    identifier: string
    firstName: string
    lastName: string
    avatar: UrlString
}>

export interface ReadAccountIoOutput {
    id: NonNullable<NonNullable<ReadAccountIoResponse>['id']>
    createdAt: Date
    identifier: NonNullable<NonNullable<ReadAccountIoResponse>['identifier']>
    firstName: NonNullable<NonNullable<ReadAccountIoResponse>['firstName']>
    lastName: NonNullable<NonNullable<ReadAccountIoResponse>['lastName']>
    avatar: NonNullable<NonNullable<ReadAccountIoResponse>['avatar']>
}

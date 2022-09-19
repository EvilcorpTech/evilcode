import type {DateString, IdString, UrlString} from '../models/types'

export interface ReadAccountResponse {
    id: IdString
    createdAt: DateString
    identifier: string
    firstName: string
    lastName: string
    avatar: UrlString
}

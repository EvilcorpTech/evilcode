import {QueryRequestOptions} from '@eviljs/web/query'

export function asAuthOptions(token: string): QueryRequestOptions {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
}

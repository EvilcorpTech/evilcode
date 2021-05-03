import {QueryRequestOptions} from '@eviljs/std-web/query'

export function asAuthOptions(token: string): QueryRequestOptions {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
}

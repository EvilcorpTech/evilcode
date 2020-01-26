import { Query, QueryRequestOptions } from 'std-web/query'

export async function queryHistory(query: Query, options?: QueryRequestOptions) {
    return await query.get('/data', options) as {

    }
}
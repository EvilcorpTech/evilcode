import {ensureArray} from '@eviljs/std/assert.js'
import type {Context, Next} from 'koa'

export const QueryRulesHeader = 'X-Query'

export function queryMiddleware(context: Context, next: Next) {
    const {request} = context

    request.rules = rulesFromRequest(context)

    return next()
}

export function rulesFromRequest(context: Context): undefined | Array<string> {
    const rulesRaw = context.get(QueryRulesHeader)
    const rulesString = rulesRaw?.trim().toLowerCase()

    if (! rulesString) {
        return
    }

    try {
        return ensureArray(JSON.parse(rulesString) as unknown).map(String)
    }
    catch (error) {
    }

    return // Makes TypeScript happy.
}

// Types ///////////////////////////////////////////////////////////////////////

declare module 'koa' {
    interface Request {
        rules?: undefined | Array<string>
    }
}

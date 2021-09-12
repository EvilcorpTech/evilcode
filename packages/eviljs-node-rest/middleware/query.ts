import {Context, Next} from 'koa'
import {QueryRulesHeader} from '@eviljs/std/query.js'

export function queryMiddleware(context: Context, next: Next) {
    const {request} = context
    const rules = rulesFromRequest(context)

    request.rules = rules

    return next()
}

export function rulesFromRequest(context: Context) {
    const rulesRaw = context.get(QueryRulesHeader)
    const rulesString = rulesRaw?.trim().toLowerCase()

    if (! rulesString) {
        return
    }

    try {
        const rules = JSON.parse(rulesString)
        return rules
    }
    catch (error) {
    }
}

// Types ///////////////////////////////////////////////////////////////////////

declare module 'koa' {
    interface Request {
        rules?: Array<string>
    }
}

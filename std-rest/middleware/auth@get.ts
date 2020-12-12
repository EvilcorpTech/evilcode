import {authorizationMiddleware} from './authorization.js'
import {assertFunction, assertObject, assertStringNotEmpty} from '@eviljs/std-lib/assert.js'
import {Context, Next} from 'koa'

export const GetAuthPath = '/auth'

export function createGetAuthMiddleware(options?: GetAuthMiddlewareOptions) {
    return {
        method: 'GET',
        path: options?.getAuthPath ?? GetAuthPath,
        middleware: [authorizationMiddleware, getAuthMiddleware],
    }
}

export async function getAuthMiddleware(ctx: Context, next: Next) {
    assertObject(ctx.container, 'ctx.container')
    assertObject(ctx.container.Db, 'ctx.container.Db')
    assertFunction(ctx.container.Db.getAccountByToken, 'ctx.container.Db.getAccountByToken')
    assertObject(ctx.state, 'ctx.state')
    assertStringNotEmpty(ctx.state.token as string, 'ctx.state.token')

    const {response, container, state} = ctx
    const {Db: db} = container
    const {getAccountByToken} = db
    const {token} = state

    const account = await getAccountByToken(db, token)

    response.body = {hi: account} // 200 OK.

    return next()
}

// Types ///////////////////////////////////////////////////////////////////////

export interface GetAuthMiddlewareOptions {
    getAuthPath?: string
}

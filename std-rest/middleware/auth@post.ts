import {assertFunction, assertObject} from '@eviljs/std-lib/assert'
import {isObject} from '@eviljs/std-lib/type'
import {Context, Next} from 'koa'

export const PostAuthPath = '/auth'

export function createPostAuthMiddleware(options?: PostAuthMiddlewareOptions) {
    return {
        method: 'POST',
        path: options?.postAuthPath ?? PostAuthPath,
        middleware: postAuthMiddleware,
    }
}

export async function postAuthMiddleware(ctx: Context, next: Next) {
    assertObject(ctx.container, 'ctx.container')
    assertObject(ctx.container.Db, 'ctx.container.Db')
    assertFunction(ctx.container.Db.getAccountByIdentifierAndSecret, 'ctx.container.Db.getAccountByIdentifierAndSecret')
    assertFunction(ctx.container.Db.createSession, 'ctx.container.Db.createSession')

    const {request, response, container} = ctx
    const {Db: db} = container
    const {getAccountByIdentifierAndSecret, createSession} = db
    const {body}  = request

    if (! body || ! isObject(body)) {
        response.status = 400 // Bad Request.

        return next()
    }

    const {identifier, secret} = body

    if (! identifier || ! secret) {
        response.status = 400 // Bad Request.

        return next()
    }

    const account = await getAccountByIdentifierAndSecret(db, identifier, secret)

    if (account.error) {
        response.status = 401 // Unathorized.
        response.body = {error: account.error}

        return next()
    }

    // Credentials are authenticated.
    // We must return the session token.
    const accountId = account.id

    // We create a session token.
    const token = await createSession(db, accountId)

    // We return the session token to the client.
    response.body = {token} // 200 OK.

    return next()
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PostAuthMiddlewareOptions {
    postAuthPath?: string
}
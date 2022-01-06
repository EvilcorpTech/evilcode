import {assertFunction, assertObject} from '@eviljs/std/assert.js'
import {Context, Next, Request} from 'koa'

export async function authorizationMiddleware(context: Context, next: Next, options?: AuthorizationOptions) {
    const {request, response, container} = context

    // const origin = request.get('Origin') // TODO
    // const referer = request.get('Referer') // TODO
    // const host = request.get('Host') // TODO
    // const xForwHost = request.get('X-Forwarded-Host') // TODO

    const authorizationInfo = await authorizationFromRequest(request, container, options)

    if (! authorizationInfo) {
        response.status = 401 // Unathorized.
        return // We block the middleware unwinding.
    }

    const {token, account, session} = authorizationInfo

    context.state.token = token
    context.state.account = account
    context.state.session = session

    return next()
}

export async function authorizationFromRequest(request: Request, container: AuthorizationContainer, options?: AuthorizationOptions) {
    // const origin = request.get('Origin') // TODO
    // const referer = request.get('Referer') // TODO
    // const host = request.get('Host') // TODO
    // const xForwHost = request.get('X-Forwarded-Host') // TODO

    const tokens = tokensFromRequest(request, options)

    for (const token of tokens) {
        const authorizationInfo = await validateAuthorizationToken(token, container, options)

        if (! authorizationInfo) {
            continue
        }

        return {
            token,
            account: authorizationInfo.account,
            session: authorizationInfo.session,
        }
    }

    return
}

export async function validateAuthorizationToken(token: string | undefined, container: AuthorizationContainer, options?: AuthorizationOptions) {
    if (! token) {
        return
    }

    assertObject(container.Db, 'container.Db')
    assertFunction(container.Db.getAccountByToken, 'container.Db.getAccountByToken')
    assertFunction(container.Db.getSessionByToken, 'container.Db.getSessionByToken')

    const {Db: db} = container
    const {getAccountByToken, getSessionByToken} = db

    const session = await getSessionByToken(db, token)
    if (! session) {
        return
    }
    const account = await getAccountByToken(db, token)
    if (! account) {
        return
    }
    return {session, account}
}

export function tokensFromRequest(request: Request, options?: AuthorizationOptions) {
    const authorizationTokens = [
        tokenFromAuthorizationHeader(request, options),
        tokenFromCookieHeader(request, options),
    ].filter(Boolean)

    return authorizationTokens as Array<string>
}

export function tokenFromAuthorizationHeader(request: Request, options?: AuthorizationOptions) {
    const headerValue = request.get('Authorization')

    if (! headerValue) {
        // There is no header value.
        return
    }

    // Authorization: Token 123
    const [protocol, token] = headerValue
        .trim()
        .split(' ')
        .filter(chunk => chunk)
        .map(it => it.toLowerCase())

    switch (protocol) {
        // The token protocol is the only implemented for now.
        case 'token':
            return token
        default:
            return
    }
}

export function tokenFromCookieHeader(request: Request, options?: AuthorizationOptions) {
    const headerValue = request.get('Cookie')

    if (! headerValue) {
        // There is no header value.
        return
    }

    // Cookie: param=abc; token=123; path=/; max-age=3600
    const cookieKey = options?.cookieKey || 'token'
    const cookieRegexp = new RegExp(`\\b${cookieKey}=([^;]*);?`)
    const cookieMatch = headerValue.match(cookieRegexp)

    if (! cookieMatch) {
        // There is no cookie matching the key.
        return
    }

    return cookieMatch[1]
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthorizationOptions {
    cookieKey?: string
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthorizationContainer {
    Db: {
        getAccountByToken(db: any, token: string): Promise<any>
        getSessionByToken(db: any, token: string): Promise<any>
    }
}

declare module 'koa' {
    interface DefaultState {
        token?: string
        account?: any
        session?: any
    }
}

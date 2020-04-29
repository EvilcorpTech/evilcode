import { authenticate, invalidate, validate, AuthCredentials, FetchOptions } from '@eviljs/std-web/auth'
import { Cookie } from '@eviljs/std-web/cookie'
import { createContext, createElement, useCallback, useContext, useEffect, useState, useMemo } from 'react'
import { Fetch } from '@eviljs/std-web/fetch'
import { useBusy } from './busy'

export const AuthContext = createContext<Auth>(void undefined as any)

export function useAuth() {
    return useContext(AuthContext)
}

export function useRootAuth(fetch: Fetch, cookie: Cookie, options?: AuthOptions) {
    const { authenticateOpts, invalidateOpts, validateOpts } = options ?? {}
    const [ cookieToken ] = useState(() => cookie.get())
    const [ token, setToken ] = useState('')
    const [ busy, busyLock, busyRelease ] = useBusy()

    useEffect(() => {
        if (! cookieToken) {
            // Optimization.
            setToken('')
            return
        }

        busyLock()

        validate(fetch, cookieToken, validateOpts)
        .then(tokenIsValid => {
            setToken(tokenIsValid
                ? cookieToken
                : ''
            )
        })
        .finally(() => {
            busyRelease()
        })
    }, [cookieToken, validateOpts?.method, validateOpts?.url])

    const authenticateCredentials = useCallback(async (credentials: AuthCredentials) => {
        busyLock()
        try {
            const token = await authenticate(fetch, credentials, authenticateOpts)

            cookie.set(token)
            setToken(token)

            return token
        }
        finally {
            busyRelease()
        }
    }, [fetch, authenticateOpts?.method, authenticateOpts?.url])

    const destroySession = useCallback(async () => {
        if (! token) {
            return false
        }

        busyLock()
        try {
            const ok = await invalidate(fetch, token, invalidateOpts)

            if (! ok) {
                throw 'ko'
            }
        }
        catch (error) {
            return false
        }
        finally {
            busyRelease()
            cookie.delete()
            setToken('')
        }

        return true
    }, [fetch, token, cookie, validateOpts?.method, validateOpts?.url])

    const auth = useMemo(() => {
        return {
            authenticate: authenticateCredentials,
            destroySession,
            pending: busy > 0,
            token,
            validToken: Boolean(token),
        }
    }, [authenticateCredentials, busy, destroySession, token])

    return auth
}

export function withAuth(children: React.ReactNode, fetch: Fetch, cookie: Cookie, options?: AuthOptions) {
    const auth = useRootAuth(fetch, cookie, options)

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}

export function AuthProvider(props: AuthProviderProps) {
    return withAuth(props.children, props.fetch, props.cookie, props)

}

export function WithAuth(Child: React.ElementType, fetch: Fetch, cookie: Cookie, options?: AuthOptions) {
    function AuthProviderProxy(props: any) {
        return withAuth(<Child {...props}/>, fetch, cookie, options)
    }

    return AuthProviderProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Auth {
    authenticate: (credentials: AuthCredentials) => Promise<string>
    pending: boolean
    destroySession: () => Promise<boolean>
    token: string
    validToken: boolean
}

export interface AuthProviderProps extends AuthOptions {
    children: React.ReactNode
    cookie: Cookie
    fetch: Fetch
}

export interface AuthOptions {
    authenticateOpts?: FetchOptions
    invalidateOpts?: FetchOptions
    validateOpts?: FetchOptions
}

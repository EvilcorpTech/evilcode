import { authenticate, invalidate, validate, AuthCredentials, FetchOptions } from '@eviljs/std-web/auth'
import { Cookie } from '@eviljs/std-web/cookie'
import { createContext, createElement, useCallback, useContext, useEffect, useState, useMemo } from 'react'
import { Fetch } from '@eviljs/std-web/fetch'
import { useBusy } from './busy'

export const AuthContext = createContext<Auth>(void undefined as any)

export function useAuth() {
    return useContext(AuthContext)
}

export function useRootAuth(container: AuthContainer, options?: AuthOptions) {
    const { Cookie: cookie, Fetch: fetch } = container
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

export function AuthProvider(props: AuthProviderProps) {
    const { container, children, ...opts} = props
    const auth = useRootAuth(container, opts)

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}

export function withAuth(Child: React.ComponentType, container: AuthContainer, options?: AuthOptions) {
    function AuthWrapper(props: any) {
        return (
            <AuthProvider container={container} {...options}>
                <Child {...props}/>
            </AuthProvider>
        )
    }

    return AuthWrapper
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
    children?: React.ReactNode
    container: AuthContainer
}

export interface AuthContainer {
    Cookie: Cookie
    Fetch: Fetch
}

export interface AuthOptions {
    authenticateOpts?: FetchOptions
    invalidateOpts?: FetchOptions
    validateOpts?: FetchOptions
}
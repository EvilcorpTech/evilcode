import {authenticate, invalidate, validate, AuthCredentials, FetchOptions} from '@eviljs/std-web/auth'
import {Cookie} from '@eviljs/std-web/cookie'
import {createContext, createElement, useCallback, useContext, useEffect, useState, useMemo} from 'react'
import {Fetch} from '@eviljs/std-web/fetch'
import {throwInvalidResponse} from '@eviljs/std-web/error'
import {useBusy} from './busy'
import {ValueOf} from '@eviljs/std-lib/type'

export const AuthContext = createContext<Auth>(void undefined as any)

export const AuthTokenState = {
    Init: null,
    Missing: 0,
    Validating: 1,
    Valid: 2,
    Invalid: -1,
} as const

export function useAuth() {
    return useContext(AuthContext)
}

export function useRootAuth(fetch: Fetch, cookie: Cookie, options?: AuthOptions) {
    const {authenticateOpts, invalidateOpts, validateOpts} = options ?? {}
    const [tokenState, setTokenState] = useState<AuthTokenState>(AuthTokenState.Init)
    const {busy, busyLock, busyRelease} = useBusy()
    const token = cookie.get()

    useEffect(() => {
        if (! token) {
            setTokenState(AuthTokenState.Missing)
            return
        }

        setTokenState(AuthTokenState.Validating)

        busyLock()

        validate(fetch, token, validateOpts)
        .then(isTokenValid => {
            setTokenState(isTokenValid
                ? AuthTokenState.Valid
                : AuthTokenState.Invalid
            )
        })
        .finally(() => {
            busyRelease()
        })
    }, [token, validateOpts?.method, validateOpts?.url])

    const authenticateCredentials = useCallback(async (credentials: AuthCredentials) => {
        busyLock()
        try {
            const token = await authenticate(fetch, credentials, authenticateOpts)

            cookie.set(token)
            setTokenState(AuthTokenState.Valid)

            return token
        }
        finally {
            busyRelease()
        }
    }, [authenticateOpts?.method, authenticateOpts?.url])

    const destroySession = useCallback(async () => {
        cookie.delete()
        setTokenState(AuthTokenState.Missing)

        if (! token) {
            return true
        }

        busyLock()
        try {
            const ok = await invalidate(fetch, token, invalidateOpts)

            if (! ok) {
                return throwInvalidResponse(
                    `@eviljs/std-react/auth.useRootAuth().destroySession()`
                )
            }
        }
        catch (error) {
            console.error(error)

            return false
        }
        finally {
            busyRelease()
        }

        return true
    }, [token, validateOpts?.method, validateOpts?.url])

    const auth = useMemo(() => {
        return {
            token,
            tokenState,
            pending: busy > 0,
            authenticate: authenticateCredentials,
            destroySession,
        }
    }, [token, tokenState, busy, authenticateCredentials, destroySession])

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

export interface Auth {
    token: string | null | undefined
    tokenState: AuthTokenState
    pending: boolean
    authenticate(credentials: AuthCredentials): Promise<string>
    destroySession(): Promise<boolean>
}

export type AuthTokenState = ValueOf<typeof AuthTokenState>

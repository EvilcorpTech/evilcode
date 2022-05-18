import {ValueOf} from '@eviljs/std/type.js'
import {
    authenticate,
    invalidate,
    validate,
    AuthCredentials,
    AuthenticateOptions,
    InvalidateOptions,
    ValidateOptions,
} from '@eviljs/web/auth.js'
import {Cookie} from '@eviljs/web/cookie.js'
import {Fetch} from '@eviljs/web/fetch.js'
import {throwInvalidResponse} from '@eviljs/web/throw.js'
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useBusyLock} from './busy.js'

export const AuthContext = createContext<unknown>(undefined)

AuthContext.displayName = 'AuthContext'

export const AuthTokenState = {
    Init: undefined,
    Missing: 0,
    Validating: 1,
    Valid: 2,
    Invalid: -1,
} as const

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: '/api'})
* const cookie = createCookie()
* const authenticate = {method, url} // Optional.
* const validate = {method, url} // Optional.
* const invalidate = {method, url} // Optional.
* const options = {authenticate, validate, invalidate}
* const Main = WithAuth(MyMain, fetch, cookie, options)
*
* render(<Main/>, document.body)
*/
export function WithAuth<P extends {}>(
    Child: React.ComponentType<P>,
    fetch: Fetch,
    cookie: Cookie,
    options?: undefined | AuthOptions,
) {
    function AuthProviderProxy(props: P) {
        return withAuth(<Child {...props}/>, fetch, cookie, options)
    }

    return AuthProviderProxy
}

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: '/api'})
* const cookie = createCookie()
* const authenticate = {method, url}
* const validate = {method, url}
* const invalidate = {method, url}
* const options = {authenticate, validate, invalidate}
*
* export function MyMain(props) {
*     return withAuth(<Child/>, fetch, cookie, options)
* }
*/
export function withAuth(
    children: React.ReactNode,
    fetch: Fetch,
    cookie: Cookie,
    options?: undefined | AuthOptions,
) {
    const auth = useRootAuth(fetch, cookie, options)

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: '/api'})
* const cookie = createCookie()
* const authenticate = {method, url}
* const validate = {method, url}
* const invalidate = {method, url}
* const options = {authenticate, validate, invalidate}
*
* export function MyMain(props) {
*     return (
*         <AuthProvider fetch={fetch} cookie={cookie} {...options}>
*             <Child/>
*         </AuthProvider>
*     )
* }
*/
export function AuthProvider(props: AuthProviderProps) {
    return withAuth(props.children, props.fetch, props.cookie, props)
}

export function useRootAuth(fetch: Fetch, cookie: Cookie, options?: undefined | AuthOptions) {
    const authenticateOptions = options?.authenticate
    const validateOptions = options?.validate
    const invalidateOptions = options?.invalidate
    const [token, setToken] = useState<undefined | string>(() => cookie.get()) // Reading document.cookie is slow.
    const [tokenState, setTokenState] = useState<AuthTokenState>(AuthTokenState.Init)
    const {busy, busyLock, busyRelease} = useBusyLock()

    useEffect(() => {
        if (! token) {
            setTokenState(AuthTokenState.Missing)
            return
        }

        if (tokenState === AuthTokenState.Valid) {
            // Token can be already valid as result of the authenticateCredentials().
            // In this case we must not re-validate it.
            return
        }

        setTokenState(AuthTokenState.Validating)
        busyLock()

        validate(fetch, token, validateOptions)
        .then(isTokenValid => {
            setTokenState(isTokenValid
                ? AuthTokenState.Valid
                : AuthTokenState.Invalid
            )
        })
        .finally(busyRelease)
    }, [fetch, validateOptions, token])


    /**
    * @throws Error
    **/
    const authenticateCredentials = useCallback(async (credentials: AuthCredentials) => {
        busyLock()
        try {
            const token = await authenticate(fetch, credentials, authenticateOptions)

            cookie.set(token)
            setToken(token)
            setTokenState(AuthTokenState.Valid)

            return token
        }
        finally {
            busyRelease()
        }
    }, [fetch, cookie, authenticateOptions])

    /**
    * @throws Error
    **/
    const destroySession = useCallback(async () => {
        cookie.delete()
        setToken(undefined)
        setTokenState(AuthTokenState.Missing)

        if (! token) {
            return
        }

        busyLock()
        try {
            const ok = await invalidate(fetch, token, invalidateOptions)

            if (! ok) {
                throwInvalidResponse(
                    `@eviljs/react/auth.useRootAuth().destroySession()`
                )
            }
        }
        finally {
            busyRelease()
        }
    }, [fetch, cookie, invalidateOptions, token])

    const auth = useMemo(() => {
        const isAuthenticated = tokenState === AuthTokenState.Valid
        return {
            token: isAuthenticated
                ? token
                : undefined
            ,
            storedToken: token,
            tokenState,
            isAuthenticated,
            pending: busy > 0,
            authenticate: authenticateCredentials,
            destroySession,
        }
    }, [token, tokenState, busy, authenticateCredentials, destroySession])

    return auth
}

export function useAuth() {
    return useContext<Auth>(AuthContext as React.Context<Auth>)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthProviderProps extends AuthOptions {
    children: React.ReactNode
    cookie: Cookie
    fetch: Fetch
}

export interface AuthOptions {
    authenticate?: AuthenticateOptions
    invalidate?: InvalidateOptions
    validate?: ValidateOptions
}

export type Auth = ReturnType<typeof useRootAuth>

export type AuthTokenState = ValueOf<typeof AuthTokenState>

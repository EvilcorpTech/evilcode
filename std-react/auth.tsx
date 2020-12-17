import {ValueOf} from '@eviljs/std-lib/type.js'
import {
    authenticate,
    invalidate,
    validate,
    AuthCredentials,
    AuthenticateOptions,
    InvalidateOptions,
    ValidateOptions,
} from '@eviljs/std-web/auth.js'
import {Cookie} from '@eviljs/std-web/cookie.js'
import {throwInvalidResponse} from '@eviljs/std-web/error.js'
import {Fetch} from '@eviljs/std-web/fetch.js'
import React from 'react'
import {useBusy} from './busy.js'
import {useIfMounted, useMountedGuard} from './react.js'
const {createContext, useCallback, useContext, useEffect, useState, useMemo} = React

export const AuthContext = createContext<Auth>(void undefined as any)

AuthContext.displayName = 'StdAuthContext'

export const AuthTokenState = {
    Init: null,
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
* const main = WithAuth(MyMain, fetch, cookie, options)
*
* render(<main/>, document.body)
*/
export function WithAuth(Child: React.ElementType, fetch: Fetch, cookie: Cookie, options?: AuthOptions) {
    function AuthProviderProxy(props: any) {
        return withAuth(<Child {...props}/>, fetch, cookie, options)
    }

    return AuthProviderProxy
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const fetch = createFetch({baseUrl: '/api'})
*     const cookie = createCookie()
*     const authenticate = {method, url}
*     const validate = {method, url}
*     const invalidate = {method, url}
*     const options = {authenticate, validate, invalidate}
*     const main = withAuth(<Main/>, fetch, cookie, options)
*
*     return main
* }
*/
export function withAuth(children: React.ReactNode, fetch: Fetch, cookie: Cookie, options?: AuthOptions) {
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
* export function MyMain(props) {
*     const fetch = createFetch({baseUrl: '/api'})
*     const cookie = createCookie()
*     const authenticate = {method, url}
*     const validate = {method, url}
*     const invalidate = {method, url}
*     const options = {authenticate, validate, invalidate}
*
*     return (
*         <AuthProvider fetch={fetch} cookie={cookie} {...options}>
*             <MyApp/>
*         </AuthProvider>
*     )
* }
*/
export function AuthProvider(props: AuthProviderProps) {
    return withAuth(props.children, props.fetch, props.cookie, props)
}

export function useRootAuth(fetch: Fetch, cookie: Cookie, options?: AuthOptions) {
    const authenticateOptions = options?.authenticate
    const invalidateOptions = options?.invalidate
    const validateOptions = options?.validate
    const [tokenState, setTokenState] = useState<AuthTokenState>(AuthTokenState.Init)
    const {busy, busyLock, busyRelease} = useBusy()
    const ifMounted = useIfMounted()
    const guardMounted = useMountedGuard()
    const token = cookie.get()

    useEffect(() => {
        if (! token) {
            setTokenState(AuthTokenState.Missing)
            return
        }

        setTokenState(AuthTokenState.Validating)

        busyLock()

        validate(fetch, token, validateOptions).then(guardMounted((isTokenValid) =>
            setTokenState(isTokenValid
                ? AuthTokenState.Valid
                : AuthTokenState.Invalid
            )
        )).finally(guardMounted(() =>
            busyRelease()
        ))
    }, [token, validateOptions?.method, validateOptions?.url])

    const authenticateCredentials = useCallback(async (credentials: AuthCredentials) => {
        busyLock()
        try {
            const token = await authenticate(fetch, credentials, authenticateOptions)

            cookie.set(token)

            ifMounted(() =>
                setTokenState(AuthTokenState.Valid)
            )

            return token
        }
        finally {
            ifMounted(() =>
                busyRelease()
            )
        }
    }, [authenticateOptions?.method, authenticateOptions?.url])

    const destroySession = useCallback(async () => {
        cookie.delete()
        setTokenState(AuthTokenState.Missing)

        if (! token) {
            return true
        }

        busyLock()
        try {
            const ok = await invalidate(fetch, token, invalidateOptions)

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
            ifMounted(() =>
                busyRelease()
            )
        }

        return true
    }, [token, validateOptions?.method, validateOptions?.url])

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

export function useAuth() {
    return useContext(AuthContext)
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

export interface Auth {
    token: string | null | undefined
    tokenState: AuthTokenState
    pending: boolean
    authenticate(credentials: AuthCredentials): Promise<string>
    destroySession(): Promise<boolean>
}

export type AuthTokenState = ValueOf<typeof AuthTokenState>

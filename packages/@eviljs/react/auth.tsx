import {
    AuthCredentials,
    authenticate,
    AuthenticateOptions,
    invalidate,
    InvalidateOptions,
    validate,
    ValidateOptions,
} from '@eviljs/web/auth.js'
import type {Cookie} from '@eviljs/web/cookie.js'
import type {Fetch} from '@eviljs/web/fetch.js'
import {throwInvalidResponse} from '@eviljs/web/throw.js'
import {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useBusyLock} from './busy.js'
import {defineContext} from './ctx.js'

export const AuthContext = defineContext<Auth>('AuthContext')

export enum AuthTokenState {
    Init = 'Initial',
    Missing = 'Missing',
    Validating = 'Validating',
    Valid = 'Valid',
    Invalid = 'Invalid',
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
    const {children, cookie, fetch, ...options} = props

    return (
        <AuthContext.Provider value={useRootAuth(fetch, cookie, options)}>
            {children}
        </AuthContext.Provider>
    )
}

export function useRootAuth(fetch: Fetch, cookie: Cookie, options?: undefined | AuthOptions) {
    const authenticateOptions = options?.authenticate
    const validateOptions = options?.validate
    const invalidateOptions = options?.invalidate
    const [token, setToken] = useState(() => cookie.get()) // Reading document.cookie is slow.
    const [tokenState, setTokenState] = useState(AuthTokenState.Init)
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
    return useContext(AuthContext)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthProviderProps extends AuthOptions {
    children: undefined | React.ReactNode
    cookie: Cookie
    fetch: Fetch
}

export interface AuthOptions {
    authenticate?: undefined | AuthenticateOptions
    invalidate?: undefined | InvalidateOptions
    validate?: undefined | ValidateOptions
}

export type Auth = ReturnType<typeof useRootAuth>

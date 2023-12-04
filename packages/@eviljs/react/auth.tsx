import type {AuthAuthenticateOptions, AuthCredentials, AuthInvalidateOptions, AuthValidateOptions} from '@eviljs/web/auth.js'
import {authenticate, invalidateAuthentication, validateAuthentication} from '@eviljs/web/auth.js'
import {throwInvalidResponse} from '@eviljs/web/throw.js'
import {useCallback, useMemo, useState} from 'react'
import {useBusyLock} from './busy.js'

export enum AuthTokenState {
    Missing = 'Missing',
    Validating = 'Validating',
    Valid = 'Valid',
    Invalid = 'Invalid',
}

export function useAuthentication(args: AuthenticationOptions) {
    const {
        authenticate: authenticateOptions,
        validate: validateOptions,
        invalidate: invalidateOptions,
    } = args
    const [tokenState, setTokenState] = useState<AuthTokenState>()
    const {busy, busyLock, busyRelease} = useBusyLock()

    const validateToken = useCallback((token: undefined | string) => {
        if (! token) {
            setTokenState(AuthTokenState.Missing)
            return
        }

        setTokenState(AuthTokenState.Validating)
        busyLock()

        validateAuthentication(token, validateOptions)
            .then(tokenIsValid => {
                setTokenState(tokenIsValid
                    ? AuthTokenState.Valid
                    : AuthTokenState.Invalid
                )
            })
            .finally(busyRelease)
    }, [validateOptions])

    const authenticateCredentials = useCallback(async (credentials: AuthCredentials) => {
        busyLock()
        try {
            const token = await authenticate(credentials, authenticateOptions)

            setTokenState(AuthTokenState.Valid)

            return token
        }
        finally {
            busyRelease()
        }
    }, [authenticateOptions])

    const destroySession = useCallback(async (token: string) => {
        setTokenState(AuthTokenState.Missing)

        if (! token) {
            return
        }

        busyLock()
        try {
            const ok = await invalidateAuthentication(token, invalidateOptions)

            if (! ok) {
                throwInvalidResponse(
                    `@eviljs/react/auth.useAuthentication().destroySession()`
                )
            }
        }
        finally {
            busyRelease()
        }
    }, [invalidateOptions])

    const auth = useMemo(() => {
        const isAuthenticated = tokenState === AuthTokenState.Valid

        return {
            tokenState,
            isAuthenticated,
            pending: busy > 0,
            validateToken,
            authenticateCredentials,
            destroySession,
        }
    }, [
        tokenState,
        busy,
        validateToken,
        authenticateCredentials,
        destroySession,
    ])

    return auth
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthenticationOptions {
    authenticate: AuthAuthenticateOptions
    invalidate: AuthInvalidateOptions
    validate: AuthValidateOptions
}

export type AuthenticationManager = ReturnType<typeof useAuthentication>

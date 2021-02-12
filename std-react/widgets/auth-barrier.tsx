import React from 'react'
import {useAuth, AuthTokenState} from '../auth.js'
const {Fragment} = React

export function AuthBarrier(props: AuthBarrierProps) {
    const {children, progress, fallback} = props
    const {tokenState} = useAuth()

    // We use fragments for typing reasons.
    switch (tokenState) {
        case AuthTokenState.Validating:
            // We are waiting the response from the server.
            return <Fragment>{progress}</Fragment>
        break
        case AuthTokenState.Valid:
            // Token has been verified and is valid. We can safely continue.
            return <Fragment>{children}</Fragment>
        break
        case AuthTokenState.Missing:
        case AuthTokenState.Invalid:
            // Token is missing or invalid.
            return <Fragment>{fallback}</Fragment>
        break
    }

    return null
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthBarrierProps {
    children: React.ReactNode
    progress: React.ReactNode
    fallback: React.ReactNode
}

import {createElement} from 'react'
import {useAuth, AuthTokenState} from '../auth.js'

export function AuthBarrier(props: AuthBarrierProps) {
    const {children, progress, fallback} = props
    const {tokenState} = useAuth()

    switch (tokenState) {
        case AuthTokenState.Validating:
            // We are waiting the response from the server.
            return progress
        break
        case AuthTokenState.Valid:
            // Token has been verified and is valid. We can safely continue.
            return children
        break
        case AuthTokenState.Missing:
        case AuthTokenState.Invalid:
            // Token is missing or invalid.
            return fallback
        break
    }

    return null
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthBarrierProps {
    children: JSX.Element
    progress: JSX.Element
    fallback: JSX.Element
}

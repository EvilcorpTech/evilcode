import {AuthTokenState} from '@eviljs/react/auth.js'

export function AuthBarrier(props: AuthBarrierProps) {
    const {children, fallback, progress, tokenState} = props

    switch (tokenState) {
        // Fast path, from the most common to least common.
        case AuthTokenState.Valid:
            return children // Token has been verified and is valid. We can safely continue.
        case AuthTokenState.Missing:
        case AuthTokenState.Invalid:
            return fallback // Token is missing or invalid.
        case AuthTokenState.Validating:
            return progress // We are waiting the response from the server.
        case undefined:
            return
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthBarrierProps {
    tokenState: undefined | AuthTokenState
    children: React.ReactNode
    progress: React.ReactNode
    fallback: React.ReactNode
}

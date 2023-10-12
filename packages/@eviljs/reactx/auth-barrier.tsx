import {useAuth, AuthTokenState} from '@eviljs/react/auth.js'

export function AuthBarrier(props: AuthBarrierProps) {
    const {children, progress, fallback} = props
    const {tokenState} = useAuth()!

    // We use fragments for typing reasons.
    switch (tokenState) {
        case AuthTokenState.Validating:
            // We are waiting the response from the server.
            return progress
        case AuthTokenState.Valid:
            // Token has been verified and is valid. We can safely continue.
            return children
        case AuthTokenState.Missing:
        case AuthTokenState.Invalid:
            // Token is missing or invalid.
            return fallback
    }

    return // Makes TypeScript happy.
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthBarrierProps {
    children: React.ReactNode
    progress: React.ReactNode
    fallback: React.ReactNode
}

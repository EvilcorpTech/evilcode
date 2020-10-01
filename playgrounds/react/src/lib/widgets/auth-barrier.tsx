import {AuthBarrier as StdAuthBarrier} from '@eviljs/std-react/widgets/auth-barrier.js'
import {createElement} from 'react'
import {Redirect} from '@eviljs/std-react/router.js'
import {useI18nMsg} from '@eviljs/std-react/i18n.js'

export const AuthRedirect = '/signin'

export function AuthBarrier(props: AuthBarrierProps) {
    const {children} = props

    return (
        <StdAuthBarrier
            progress={<AuthProgress/>}
            fallback={<Redirect to={AuthRedirect}/>}
        >
            {children}
        </StdAuthBarrier>
    )
}

export function AuthProgress() {
    const msg = useI18nMsg(({ t }) => ({
        auth: t`Authenticating`,
    }))

    return (
        <h1 className="std-stack-v std-primary-accent">
            {msg.auth}...
        </h1>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthBarrierProps {
    children: JSX.Element
}

import {AuthBarrier as Barrier} from '@eviljs/reactx/auth-barrier/v1'
import {Redirect} from '@eviljs/react/router'
import {useI18nMsg} from '@eviljs/react/i18n'

export const AuthRedirect = '/auth'

export function AuthBarrier(props: AuthBarrierProps) {
    const {children} = props

    return (
        <Barrier
            progress={<AuthProgress/>}
            fallback={<Redirect to={AuthRedirect}/>}
        >
            {children}
        </Barrier>
    )
}

export function AuthProgress() {
    const msg = useI18nMsg(({ t }) => ({
        auth: t`Authenticating`,
    }))

    return (
        <h1 className="std-stack-v std-color-primary-accent">
            {msg.auth}...
        </h1>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthBarrierProps {
    children: JSX.Element
}

import {AuthCredentials} from '@eviljs/std-react/widgets/auth-credentials.js'
import {classes} from '@eviljs/std-react/react.js'
import {createElement, useCallback} from 'react'
import {useAuth, AuthTokenState} from '@eviljs/std-react/auth.js'
import {useI18nMsg} from '@eviljs/std-react/i18n.js'
import {useRouter, Redirect} from '@eviljs/std-react/router.js'

export function AuthView(props: AuthViewProps) {
    const msg = useI18nMsg(({ t }) => ({
        error: t`Email o Password errate`,
        identifier: t`Email`,
        secret: t`Password`,
        signin: t`Entra`,
    }))
    const {tokenState} = useAuth()
    const {routeParams} = useRouter()
    const redirectPath = routeParams.redirect ?? '/'

    const formatError = useCallback(error => {
        return msg.error
    }, [msg.error])

    if (tokenState === AuthTokenState.Valid) {
        return <Redirect to={redirectPath}/>
    }

    return (
        <div className={classes('view-b62248 std-theme light', props.className)}>
            <AuthCredentials
                className="credentials-b2bec8"
                messages={msg}
                formatError={formatError}
            />
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthViewProps {
    className?: string
}

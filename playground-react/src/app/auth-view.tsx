import {AuthCredentials} from '@eviljs/reactx/auth-credentials/v1'
import {useAuth, AuthTokenState} from '@eviljs/std-react/auth'
import {useI18nMsg} from '@eviljs/std-react/i18n'
import {classes} from '@eviljs/std-react/react'
import {useRouter, Redirect} from '@eviljs/std-react/router'
import React from 'react'
const {useCallback} = React

import './auth-view.css'

export function AuthView(props: AuthViewProps) {
    const msg = useI18nMsg(({ t }) => ({
        error: t`Wrong Email or Password`,
        identifier: t`Email`,
        secret: t`Password`,
        signin: t`Enter`,
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
        <div className={classes('AuthView-b622 std-theme light std-extend-v std-stack h', props.className)}>
            <AuthCredentials
                className="credentials-b2be"
                messages={msg}
                formatError={formatError}
            />
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthViewProps extends React.HTMLAttributes<HTMLDivElement> {
}

import {useAuth, AuthTokenState} from '@eviljs/react/auth'
import {classes} from '@eviljs/react/react'
import {useRouter, Redirect} from '@eviljs/react/router'
import {AuthCredentials} from '@eviljs/reactx/auth-credentials/v1'
import {useCallback} from 'react'
import {useI18nMsg} from 'lib/hooks'

import './auth-view.css'

export function AuthView(props: AuthViewProps) {
    const {className, ...otherProps} = props
    const {tokenState} = useAuth()
    const {routeParams} = useRouter()
    const redirectPath = routeParams.redirect ?? '/'

    const msg = useI18nMsg(({ t }) => ({
        error: t`Wrong Email or Password`,
        identifier: t`Email`,
        secret: t`Password`,
        signin: t`Enter`,
    }))

    const formatError = useCallback(error => {
        return msg.error
    }, [msg.error])

    if (tokenState === AuthTokenState.Valid) {
        return <Redirect to={redirectPath}/>
    }

    return (
        <div
            {...otherProps}
            className={classes('AuthView-b622 std-theme light std-extend-v std-stack h', className)}
        >
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

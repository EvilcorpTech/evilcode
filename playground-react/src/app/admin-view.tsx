import {Button} from '@eviljs/reactx/button/v1'
import {useAuth} from '@eviljs/std-react/auth'
import {useI18nMsg} from '@eviljs/std-react/i18n'
import {classes} from '@eviljs/std-react/react'
import React from 'react'
import {Header} from 'lib/widgets/header'
const {useCallback} = React

import './admin-view.css'

export function AdminView(props: AdminViewProps) {
    const {className, ...otherProps} = props
    const {destroySession} = useAuth()

    const msg = useI18nMsg(({ t }) => {
        return {
            title: t`Admin page`,
        }
    })

    const onExitButtonClick = useCallback(() => {
        destroySession()
    }, [])

    return (
        <div
            {...otherProps}
            className={classes('AdminView-a22c std-theme light', className)}
        >
            <Header/>

            <h1 className="page-title">
                {msg.title}
            </h1>

            <Button
                className="halo"
                onClick={onExitButtonClick}
            >
                Exit
            </Button>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AdminViewProps extends React.HTMLAttributes<HTMLDivElement> {
}

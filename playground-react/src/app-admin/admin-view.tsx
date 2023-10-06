import './admin-view.css'

import {useAuth} from '@eviljs/react/auth'
import {classes} from '@eviljs/react/classes'
import {Text} from '@eviljs/react/text'
import {Button} from '@eviljs/reactx/button'
import {useCallback} from 'react'
import {Header} from '~/ui-widgets/header'

export function AdminView(props: AdminViewProps) {
    const {className, ...otherProps} = props
    const {destroySession} = useAuth()!

    const onExitButtonClick = useCallback(() => {
        destroySession()
    }, [])

    return (
        <div
            {...otherProps}
            className={classes('AdminView-a22c', className)}
        >
            <Header/>

            <Text tag="h1" className="page-title">
                Admin
            </Text>

            <Button
                className="std-button-halo"
                onClick={onExitButtonClick}
            >
                <Text>
                    Exit
                </Text>
            </Button>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AdminViewProps extends React.HTMLAttributes<HTMLElement> {
}

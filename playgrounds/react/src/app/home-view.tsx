import {Button} from '@eviljs/std-react/widgets/button'
import {classes} from '@eviljs/std-react/react'
import {createElement} from 'react'
import {useI18nMsg} from '@eviljs/std-react/i18n'

import './home-view.css'

export function HomeView(props: HomeViewProps) {
    const msg = useI18nMsg(({ t }) => {
        return {
            example: t`Home`,
        }
    })

    return (
        <div
            {...props}
            className={classes('home-view-0d5180 std-theme light', props.className)}
        >
            <h1>
                {msg.example}
            </h1>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HomeViewProps {
    className?: string
    [key: string]: unknown
}

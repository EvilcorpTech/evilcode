import {classes} from '@eviljs/react/react'
import {ThemeView} from '@eviljs/reactx/theme-view/v1'
import {WidgetsView} from '@eviljs/reactx/widgets-view/v1'
import {Header} from 'lib/widgets/header'
import {useI18nMsg} from 'lib/hooks'

import './ui-view.css'

export function UiView(props: UiViewProps) {
    const {className, ...otherProps} = props

    const msg = useI18nMsg(({ t }) => {
        return {
            title: t`Ui`,
        }
    })

    return (
        <div
            {...otherProps}
            className={classes('UiView-54e6 std-theme light', className)}
        >
            <Header/>

            <h1 className="page-title">
                {msg.title}
            </h1>

            <ThemeView>
                <WidgetsView/>
            </ThemeView>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface UiViewProps extends React.HTMLAttributes<HTMLDivElement> {
}

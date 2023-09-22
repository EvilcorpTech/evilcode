import './home-view.css'

import {classes} from '@eviljs/react/classes'
import {useI18nMsg} from '~/i18n/i18n-hooks'
import {Header} from '~/ui-widgets/header'

export function HomeView(props: HomeViewProps) {
    const {className, ...otherProps} = props

    const msg = useI18nMsg(({ translate }) => {
        return {
            title: translate('Home'),
        }
    })

    return (
        <div
            {...otherProps}
            className={classes('HomeView-0d51', className)}
        >
            <Header/>

            <h1 className="page-title">
                {msg.title}
            </h1>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HomeViewProps extends React.HTMLAttributes<HTMLDivElement> {
}

import {classes} from '@eviljs/std-react/react.js'
import {createElement} from 'react'

export function NotFoundView(props: NotFoundViewProps) {
    return (
        <h1 className={classes('view-b62248 std-theme light', props.className)}>
            404
        </h1>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface NotFoundViewProps {
    className?: string
}

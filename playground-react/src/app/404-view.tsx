import {classes} from '@eviljs/react/react.js'

export function NotFoundView(props: NotFoundViewProps) {
    return (
        <h1 className={classes('NotFoundView-ab42 std-theme light', props.className)}>
            404
        </h1>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface NotFoundViewProps extends React.HTMLAttributes<HTMLDivElement> {
}

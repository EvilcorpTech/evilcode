import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'

export function NotificationBadge(props: Props<NotificationBadgeProps>): React.JSX.Element {
    const {children, className, value, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('NotificationBadge-3046', className)}
        >
            <span className="value-3db7">
                {value}
            </span>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface NotificationBadgeProps extends ElementProps<'div'> {
    value: number | string
}

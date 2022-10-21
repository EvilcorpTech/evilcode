import './notification-badge.css'

import {classes} from '@eviljs/react/classes.js'

export function NotificationBadge(props: NotificationBadgeProps) {
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

export interface NotificationBadgeProps extends React.HTMLAttributes<HTMLElement> {
    value: number | string
}

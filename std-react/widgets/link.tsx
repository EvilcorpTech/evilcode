import {classes} from '../react.js'
import {Route} from '../router.js'
import React from 'react'

export function Link(props: LinkProps) {
    const {children, to, ...otherProps} = props
    const isRoute = to[0] === '/'

    if (isRoute) {
        return (
            <Route
                {...otherProps}
                className={classes('link-181232 route', props.className)}
                to={to}
            >
                {children}
            </Route>
        )
    }

    return (
        <a
            {...otherProps}
            className={classes('link-181232 external', props.className)}
            href={to}
            target="_blank"
        >
            {children}
        </a>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: React.ReactNode
    to: string
}

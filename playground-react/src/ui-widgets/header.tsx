import './header.css'

import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'
import {Route} from '@eviljs/react/router'

export function Header(props: Props<HeaderProps>) {
    const {className, ...otherProps} = props

    const menu = [
        {to: '/', message: 'Home'},
        {to: '/en/showcase', message: 'Showcase'},
        {to: '/example/123', message: 'Arg'},
    ]

    return (
        <header
            {...otherProps}
            className={classes('Header-cf53', className)}
        >
            <nav>
                <ul className="std-flex std-flex-align-center">
                    {menu.map((it, idx) =>
                        <li
                            key={idx}
                            className="item-ac64"
                        >
                            <Route
                                className="route-d291"
                                to={it.to}
                                activeExact
                            >
                                {it.message}
                            </Route>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HeaderProps extends ElementProps<'div'> {
}

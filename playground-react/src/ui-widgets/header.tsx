import './header.css'

import {classes} from '@eviljs/react/classes'
import {Route} from '@eviljs/react/router'
import * as Routes from '~/route/route-apis'

const Menu = [
    {to: Routes.RootRoute.path(), message: 'Home'},
    {to: Routes.ShowcaseRoute.path(), message: 'Showcase'},
    {to: '/arg/123', message: 'Arg'},
    {to: Routes.AdminRoute.path(), message: 'Admin'},
]

export function Header(props: HeaderProps) {
    const {children, className, ...otherProps} = props

    return (
        <header
            {...otherProps}
            className={classes('Header-cf53', className)}
        >
            <nav>
                <ul className="std-flex std-flex-align-center">
                    {Menu.map((it, idx) =>
                        <li
                            key={idx}
                            className="item-ac64"
                        >
                            <Route
                                className="route-d291"
                                to={it.to}
                                activeWhenExact
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

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
}

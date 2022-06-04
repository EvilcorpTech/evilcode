import {classes} from '@eviljs/react/classes'
import {Route} from '@eviljs/react/router'
import {StoreState, useStore} from '../hooks/store'
import * as Routes from '../routes'

import './header.css'

const Menu = [
    {to: Routes.RootRoute.path(), message: 'Home'},
    {to: Routes.ShowcaseRoute.path(), message: 'Showcase'},
    {to: '/arg/123', message: 'Arg'},
    {to: Routes.AdminRoute.path(), message: 'Admin'},
]

export function Header(props: HeaderProps) {
    const {children, className, ...otherProps} = props
    const [theme] = useStore((state: StoreState) => state.theme)

    return (
        <header
            {...otherProps}
            className={classes('Header-cf53', className)}
        >
            <nav>
                <ul className="std-flex align-center">
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

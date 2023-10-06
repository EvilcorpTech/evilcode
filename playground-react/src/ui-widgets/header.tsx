import './header.css'

import {classes} from '@eviljs/react/classes'
import {useRoutePathLocalized} from '@eviljs/react/route'
import {Route} from '@eviljs/react/router'
import {RoutePath} from '~/route/route-paths'

export function Header(props: HeaderProps) {
    const {children, className, ...otherProps} = props

    const routes = {
        home: useRoutePathLocalized(RoutePath.Home),
        admin: useRoutePathLocalized(RoutePath.Admin),
        showcase: useRoutePathLocalized(RoutePath.Showcase),
        example: useRoutePathLocalized(RoutePath.ExampleWithArg),
    }

    const menu = [
        {to: routes.home.link(), message: 'Home'},
        {to: routes.showcase.link(), message: 'Showcase'},
        {to: routes.admin.link(), message: 'Admin'},
        {to: routes.example.link('123'), message: 'Arg'},
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

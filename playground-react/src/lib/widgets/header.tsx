import {classes} from '@eviljs/react/react'
import {Route} from '@eviljs/react/router'

import './header.css'

const Routes = [
    {to: '/', message: 'Home'},
    {to: '/ui', message: 'Ui'},
    {to: '/admin', message: 'Admin'},
]

export function Header(props: HeaderProps) {
    const {children, className, ...otherProps} = props

    return (
        <header
            {...otherProps}
            className={classes('Header-cf53', className)}
        >
            <nav>
                <ul className="std-flex align-center">
                    {Routes.map((it, idx) =>
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

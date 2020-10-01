import {ALL} from '@eviljs/std-web/router.js'
import {AuthBarrier} from '../lib/widgets/auth-barrier'
import {AuthView} from './auth-view'
import {BASE_URL, ROUTER_TYPE} from '../lib/context'
import {BrowserRouter, HashRouter, Route, Switch} from 'react-router-dom'
import {Container} from '../lib/container'
import {createElement, useCallback, useMemo} from 'react'
import {ElementOf} from '@eviljs/std-lib/type.js'
import {HomeRoute, ExampleRoute, ThemeRoute} from '../lib/routes'
import {HomeView} from './home-view'
import {NotFoundView} from './404-view'
import {PortalProvider} from '@eviljs/std-react/portal.js'
import {ThemeView} from '@eviljs/std-react/widgets/theme-view.js'
import {useAuth} from '@eviljs/std-react/auth.js'
import {useRouter, SwitchRoute} from '@eviljs/std-react/router.js'
import {withAuth} from '@eviljs/std-react/auth.js'
import {withContainer} from '@eviljs/std-react/container.js'
import {withFetch} from '@eviljs/std-react/fetch.js'
import {withI18n} from '@eviljs/std-react/i18n.js'
import {withLogger} from '@eviljs/std-react/logger.js'
import {withQuery} from '@eviljs/std-react/query.js'
import {withRouter} from '@eviljs/std-react/router.js'
import {withStore} from '@eviljs/std-react/store.js'

const Router = ROUTER_TYPE === 'history'
    ? BrowserRouter
    : HashRouter

export function App(props: any) {
    const {container} = props

    let app = <AppMain1/>
    // let app = <AppMain2/>
    app = withAuth(app, container.Fetch, container.Cookie)
    app = withContainer(app, container)
    app = withFetch(app, container.Fetch)
    app = withI18n(app, container.I18n)
    app = withLogger(app, container.Logger)
    app = withQuery(app, container.Query)
    app = withRouter(app)
    app = withStore(app, container.StoreSpec)
    return app
}

export const Views = [
    {
        label: 'Home',
        pattern: HomeRoute.pattern,
        path: HomeRoute.path(),
        view: HomeView,
    },
    {
        label: 'Theme',
        pattern: ThemeRoute.pattern,
        path: ThemeRoute.path(),
        view: ThemeView,
    },
    {
        label: 'Example',
        pattern: ExampleRoute.pattern,
        path: ExampleRoute.path(),
        view: () => <h1>Example</h1>,
    },
    {
        label: '404',
        pattern: new RegExp(ALL),
        path: '/404',
        view: NotFoundView,
    },
]

export function AppMain1(props: AppMainProps) {
    const {destroySession} = useAuth()

    const onExitButtonClick = useCallback(() => {
        destroySession()
    }, [])

    return (
        <PortalProvider children={Portal =>
            <Fragment>
                <SwitchRoute default={<NotFoundView />}>
                    {[
                        {is: HomeRoute.pattern, then:
                            <AuthBarrier>
                                <HomeView/>
                            </AuthBarrier>
                        },
                        {is: ExampleRoute.pattern, then: <h1>Example</h1>},
                        {is: ThemeRoute.pattern, then: <ThemeView />},
                    ]}
                </SwitchRoute>

                <Portal/>
            </Fragment>
        }/>
    )
}

export function AppMain2(props: AppMainProps) {
    const {routePath, routeTo, testRoute} = useRouter()

    const onNavigationClick = useCallback((item: ElementOf<typeof Views>) => {
        routeTo(item.path)
    }, [])

    const routed = useMemo(() => {
        return Views.find(it => testRoute(it.pattern))
    }, [routePath])

    if (! routed) {
        return null
    }

    return <routed.view/>
}

export function AppMain3(props: AppMainProps) {
    return (
        <Router basename={BASE_URL}>
            <Switch>
                <Route exact path="/">
                    <HomeView/>
                </Route>
                <Route exact path="/theme">
                    <ThemeView/>
                </Route>
                <Route path="/signin">
                    <AuthView/>
                </Route>
                <Route path="/example">
                    <AuthBarrier>
                        <h1>Example</h1>
                    </AuthBarrier>
                </Route>
                <Route path="*">
                    <NotFoundView/>
                </Route>
            </Switch>
        </Router>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AppProps {
    container: Container
}

export interface AppMainProps {
    className?: string
}

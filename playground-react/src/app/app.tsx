import {withAuth} from '@eviljs/react/auth'
import {withContainer} from '@eviljs/react/container'
import {withFetch} from '@eviljs/react/fetch'
import {withI18n} from '@eviljs/react/i18n'
import {withLogger} from '@eviljs/react/logger'
import {PortalProvider} from '@eviljs/react/portal'
import {withQuery} from '@eviljs/react/query'
import {Arg, exact, SwitchRoute, withRouter} from '@eviljs/react/router'
import {withStore} from '@eviljs/react/store'
import {ThemeView} from '@eviljs/reactx/theme-view/v1'
import {WidgetsView} from '@eviljs/reactx/widgets-view/v1'
import {Fragment} from 'react'
import {Container} from 'lib/container'
import {BasePath, RouterType} from 'lib/context'
import * as Routes from 'lib/routes'
import {AuthBarrier} from 'lib/widgets/auth-barrier'
import {Header} from 'lib/widgets/header'
import {NotFoundView} from './404-view'
import {AdminView} from './admin-view'
import {AuthView} from './auth-view'
import {HomeView} from './home-view'
import {LabView} from './lab-view'

export function App(props: AppProps) {
    const {container} = props

    let app = <AppMain/>
    app = withAuth(app, container.Fetch, container.Cookie)
    app = withContainer(app, container)
    app = withFetch(app, container.Fetch)
    app = withI18n(app, container.I18n)
    app = withLogger(app, container.Logger)
    app = withQuery(app, container.Query)
    app = withRouter(app, {type: RouterType, basePath: BasePath})
    app = withStore(app, container.StoreSpec)
    return app
}

export function AppMain(props: AppMainProps) {
    return (
        <PortalProvider children={Portal =>
            <Fragment>
                <SwitchRoute default={<NotFoundView/>}>
                    {[
                        {is: Routes.RootRoute.pattern, then:
                            <HomeView/>
                        },
                        {is: Routes.ThemeRoute.pattern, then:
                            <div className="std-theme light">
                                <Header/>
                                <ThemeView/>
                            </div>
                        },
                        {is: Routes.WidgetsRoute.pattern, then:
                            <div className="std-theme light">
                                <Header/>
                                <WidgetsView/>
                            </div>
                        },
                        {is: Routes.LabRoute.pattern, then:
                            <LabView/>
                        },
                        {is: Routes.AdminRoute.pattern, then:
                            <AuthBarrier>
                                <AdminView/>
                            </AuthBarrier>
                        },
                        {is: Routes.AuthRoute.pattern, then:
                            <AuthView/>
                        },
                        {is: exact('/arg/' + Arg), then: (id) =>
                            <h1>Route ID {id}</h1>
                        },
                    ]}
                </SwitchRoute>

                <Portal/>
            </Fragment>
        }/>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AppProps {
    container: Container
}

export interface AppMainProps {
    className?: string
}

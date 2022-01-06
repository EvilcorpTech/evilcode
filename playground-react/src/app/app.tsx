import {withAuth} from '@eviljs/react/auth'
import {withContainer} from '@eviljs/react/container'
import {withFetch} from '@eviljs/react/fetch'
import {withI18n} from '@eviljs/react/i18n'
import {withLogger} from '@eviljs/react/logger'
import {PortalProvider} from '@eviljs/react/portal'
import {withPortals} from '@eviljs/react/portals'
import {withQuery} from '@eviljs/react/query'
import {Arg, exact, SwitchRoute, withRouter} from '@eviljs/react/router'
import {useRootStoreStorage, withStore} from '@eviljs/react/store'
import {ThemeView} from '@eviljs/reactx/theme-view'
import {WidgetsView} from '@eviljs/reactx/widgets-view'
import {pipe} from '@eviljs/std/pipe'
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
import {PortalsView} from './portals-view'

export function App(props: AppProps) {
    const {container} = props

    return pipe(<AppMain/>)
    .to(it => withAuth(it, container.Fetch, container.Cookie))
    .to(it => withContainer(it, container))
    .to(it => withFetch(it, container.Fetch))
    .to(it => withI18n(it, container.I18n))
    .to(it => withLogger(it, container.Logger))
    .to(it => withPortals(it))
    .to(it => withQuery(it, container.Query))
    .to(it => withRouter(it, {type: RouterType, basePath: BasePath}))
    .to(it => withStore(it, container.StoreSpec))
    .end()
}

export function AppMain(props: AppMainProps) {
    useRootStoreStorage()

    return (
        <PortalProvider children={Portal =>
            <Fragment>
                <SwitchRoute default={<NotFoundView/>}>
                    {[
                        {is: Routes.RootRoute.pattern, then:
                            <HomeView/>
                        },
                        {is: Routes.ThemeRoute.pattern, then:
                            <div className="std std-theme-light">
                                <Header/>
                                <ThemeView/>
                            </div>
                        },
                        {is: Routes.WidgetsRoute.pattern, then:
                            <div className="std std-theme-light">
                                <Header/>
                                <WidgetsView/>
                            </div>
                        },
                        {is: Routes.PortalsRoute.pattern, then:
                            <PortalsView/>
                        },
                        {is: Routes.LabRoute.pattern, then:
                            <LabView/>
                        },
                        {is: exact('/arg/' + Arg), then: (id) =>
                        <div className="std std-theme-light">
                            <Header/>
                            <h1>Route ID {id}</h1>
                        </div>
                        },
                        {is: Routes.AdminRoute.pattern, then:
                            <AuthBarrier>
                                <AdminView/>
                            </AuthBarrier>
                        },
                        {is: Routes.AuthRoute.pattern, then:
                            <AuthView/>
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

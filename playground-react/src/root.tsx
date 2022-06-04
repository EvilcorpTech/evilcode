import {withAuth} from '@eviljs/react/auth'
import {withContainer} from '@eviljs/react/container'
import {withI18n} from '@eviljs/react/i18n'
import {withLogger} from '@eviljs/react/logger'
import {PortalProvider} from '@eviljs/react/portal'
import {withPortals} from '@eviljs/react/portals'
import {withRequest} from '@eviljs/react/request'
import {Arg, CaseRoute, exact, SwitchRoute, withRouter} from '@eviljs/react/router'
import {useRootStoreStorage, withStore} from '@eviljs/react/store'
import {Showcase} from '@eviljs/reactx/showcase'
import {pipe} from '@eviljs/std/pipe'
import {Fragment} from 'react'
import {NotFoundView} from './app/404-view'
import {AdminView} from './app/admin-view'
import {AuthView} from './app/auth-view'
import {HomeView} from './app/home-view'
import ShowcaseIndex from './app/showcase'
import {Container} from './container'
import {StoreStorageSpec} from './hooks/store'
import {RouterSpec} from './router'
import * as Routes from './routes'
import {StoreSpec} from './store'
import {AuthBarrier} from './widgets/auth-barrier'
import {Header} from './widgets/header'

import '@eviljs/reactx/showcase/theme-v1.css'

export function RootContext(props: RootContextProps) {
    const {container} = props

    return pipe(<Root/>)
        .to(it => withAuth(it, container.Fetch, container.Cookie))
        .to(it => withContainer(it, container))
        .to(it => withI18n(it, container.I18n))
        .to(it => withLogger(it, container.Logger))
        .to(it => withPortals(it))
        .to(it => withRequest(it, container.Fetch))
        .to(it => withRouter(it, RouterSpec))
        .to(it => withStore(it, StoreSpec))
    .end()
}

export function Root(props: RootProps) {
    useRootStoreStorage(StoreStorageSpec)

    return (
        <PortalProvider children={Portal =>
            <Fragment>
                <SwitchRoute default={<NotFoundView/>}>
                    <CaseRoute is={Routes.RootRoute.pattern}>
                        <HomeView/>
                    </CaseRoute>
                    <CaseRoute is={Routes.ShowcaseRoute.pattern}>
                        <div className="std theme-light">
                            <Header/>
                            <Showcase>{ShowcaseIndex}</Showcase>
                        </div>
                    </CaseRoute>
                    <CaseRoute is={exact('/arg/' + Arg)}>
                        {(...[id]) =>
                            <div className="std theme-light">
                                <Header/>
                                <h1>Route ID {id}</h1>
                            </div>
                        }
                    </CaseRoute>
                    <CaseRoute is={Routes.AdminRoute.pattern}>
                        <AuthBarrier>
                            <AdminView/>
                        </AuthBarrier>
                    </CaseRoute>
                    <CaseRoute is={Routes.AuthRoute.pattern}>
                        <AuthView/>
                    </CaseRoute>
                </SwitchRoute>

                <Portal/>
            </Fragment>
        }/>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RootContextProps {
    children: React.ReactNode
    container: Container
}

export interface RootProps {
}

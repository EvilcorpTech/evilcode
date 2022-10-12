import '@eviljs/reactx/showcase/theme-v1.css'

import {withAuth} from '@eviljs/react/auth'
import {classes} from '@eviljs/react/classes'
import {withContainer} from '@eviljs/react/container'
import {withI18n} from '@eviljs/react/i18n'
import {withLogger} from '@eviljs/react/logger'
import {Portal, withPortal} from '@eviljs/react/portal'
import {withPortals} from '@eviljs/react/portals'
import {withRequest} from '@eviljs/react/request'
import {Arg, CaseRoute, exact, SwitchRoute, withRouter} from '@eviljs/react/router'
import {useRootStoreStorage, withStore} from '@eviljs/react/store'
import {Showcase} from '@eviljs/reactx/showcase'
import {pipe} from '@eviljs/std/pipe'
import {NotFoundView} from '~/app-404/404-view'
import {AdminView} from '~/app-admin/admin-view'
import {AuthView} from '~/app-auth/auth-view'
import {HomeView} from '~/app-home/home-view'
import ShowcaseIndex from '~/app-showcase'
import type {Container} from '~/container/apis'
import * as Routes from '~/route/apis'
import {RouterSpec} from '~/router/router'
import {StoreSpec, StoreStorageSpec} from '~/store/apis'
import {Theme, themeClassOf} from '~/theme/apis'
import {AuthBarrier} from '~/widgets/auth-barrier'
import {Header} from '~/widgets/header'

export function RootContext(props: RootContextProps) {
    const {container} = props

    return pipe(<Root/>)
        .to(it => withAuth(it, container.Fetch, container.Cookie))
        .to(it => withContainer(it, container))
        .to(it => withI18n(it, container.I18n))
        .to(it => withLogger(it, container.Logger))
        .to(it => withPortal(it))
        .to(it => withPortals(it))
        .to(it => withRequest(it, container.Fetch))
        .to(it => withRouter(it, RouterSpec))
        .to(it => withStore(it, StoreSpec))
    .end()
}

export function Root(props: RootProps) {
    useRootStoreStorage(StoreStorageSpec)

    return <>
        <SwitchRoute default={<NotFoundView/>}>
            <CaseRoute is={Routes.RootRoute.pattern}>
                <HomeView/>
            </CaseRoute>
            <CaseRoute is={Routes.ShowcaseRoute.pattern}>
                <div className={classes(themeClassOf(Theme.Light))}>
                    <Header/>
                    <Showcase>{ShowcaseIndex}</Showcase>
                </div>
            </CaseRoute>
            <CaseRoute is={exact('/arg/' + Arg)}>
                {(...[id]) =>
                    <div className={classes(themeClassOf(Theme.Light))}>
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
    </>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RootContextProps {
    children: React.ReactNode
    container: Container
}

export interface RootProps {
}

import '@eviljs/reactx/showcase/theme-v1.css'

import {AuthProvider} from '@eviljs/react/auth'
import {ContainerProvider} from '@eviljs/react/container'
import {I18nProvider} from '@eviljs/react/i18n'
import {LoggerProvider} from '@eviljs/react/logger'
import {Portal, PortalProvider} from '@eviljs/react/portal'
import {PortalsProvider} from '@eviljs/react/portals'
import {RequestProvider} from '@eviljs/react/request'
import {Arg, CaseRoute, exact, RouterProvider, SwitchRoute} from '@eviljs/react/router'
import {StoreProvider} from '@eviljs/react/store-v3'
import {Showcase} from '@eviljs/reactx/showcase'
import {pipe} from '@eviljs/std/pipe'
import {NotFoundView} from '~/app-404/404-view'
import {AdminView} from '~/app-admin/admin-view'
import {AuthView} from '~/app-auth/auth-view'
import {HomeView} from '~/app-home/home-view'
import ShowcaseIndex from '~/app-showcase'
import type {Container} from '~/container/apis'
import {I18nSpec} from '~/i18n/apis'
import * as Routes from '~/route/apis'
import {createRouter} from '~/router/router'
import {StoreSpec} from '~/store/apis'
import {useRootStoreStorage} from '~/store/hooks'
import {useColorSchemePreference} from '~/theme/hooks'
import {AuthBarrier} from '~/widgets/auth-barrier'
import {Header} from '~/widgets/header'

export function Root(props: RootProps) {
    const {children, container} = props
    const {Cookie, Fetch, Logger, Query} = container

    return pipe(children)
        .to(it => AuthProvider({children: it, fetch: Fetch, cookie: Cookie}))
        .to(it => ContainerProvider({children: it, value: container}))
        .to(it => I18nProvider({children: it, ...I18nSpec}))
        .to(it => LoggerProvider({children: it, value: Logger}))
        .to(it => PortalProvider({children: it}))
        .to(it => PortalsProvider({children: it}))
        .to(it => RequestProvider({children: it, value: Query}))
        .to(it => RouterProvider({children: it, createRouter}))
        .to(it => StoreProvider({children: it, ...StoreSpec}))
    .end()
}

export function App(props: AppProps) {
    useRootStoreStorage()
    useColorSchemePreference()

    return <>
        <SwitchRoute default={<NotFoundView/>}>
            <CaseRoute is={Routes.RootRoute.pattern}>
                <HomeView/>
            </CaseRoute>
            <CaseRoute is={Routes.ShowcaseRoute.pattern}>
                <div>
                    <Header/>
                    <Showcase>{ShowcaseIndex}</Showcase>
                </div>
            </CaseRoute>
            <CaseRoute is={exact('/arg/' + Arg)}>
                {(...[id]) =>
                    <div>
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

export interface RootProps {
    children: React.ReactNode
    container: Container
}

export interface AppProps {
}

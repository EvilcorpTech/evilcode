import '@eviljs/reactx/showcase/theme-v1.css'

import {AuthProvider} from '@eviljs/react/auth'
import {ContainerProvider} from '@eviljs/react/container'
import {StoreProvider as StoreProviderV4} from '@eviljs/react/experimental/store-v4'
import {I18nProvider} from '@eviljs/react/i18n'
import {LoggerProvider} from '@eviljs/react/logger'
import {Portal, PortalProvider} from '@eviljs/react/portal'
import {PortalsProvider} from '@eviljs/react/portals'
import {RequestProvider} from '@eviljs/react/request'
import {RouterProvider} from '@eviljs/react/router'
import {piping} from '@eviljs/std/pipe'
import type {Container} from '~/container/container-apis'
import {I18nSpec} from '~/i18n/i18n-apis'
import {createRouter} from '~/router/router-apis'
import {RouterStatic} from '~/router/router-static'
import {StoreSpec as StoreSpecV4} from '~/store-v4-experimental/store-v4-experimental-apis'
import {useStoreStorage} from '~/store/store-hooks'
import {StoreSpec as StoreSpecV3} from '~/store/store-v3-apis'
import {StoreProvider as StoreProviderV3} from '~/store/store-v3-hooks'
import {useColorSchemePreference} from '~/theme/theme-hooks'

export function RootContext(props: RootContextProps) {
    const {children, container} = props
    const {Cookie, Fetch, Logger, Query} = container

    return piping(children)
        (it => AuthProvider({children: it, fetch: Fetch, cookie: Cookie}))
        (it => ContainerProvider({children: it, value: container}))
        (it => I18nProvider({children: it, ...I18nSpec}))
        (it => LoggerProvider({children: it, value: Logger}))
        (it => PortalProvider({children: it}))
        (it => PortalsProvider({children: it}))
        (it => RequestProvider({children: it, value: Query}))
        (it => RouterProvider({children: it, createRouter}))
        (it => StoreProviderV3({children: it, ...StoreSpecV3}))
        (it => StoreProviderV4({children: it, ...StoreSpecV4}))
    ()
}

export function Root(props: RootProps) {
    return <>
        <RouterStatic/>
        <Portal/>
    </>
}

export function RootIsolate(props: RootIsolateProps): undefined {
    useColorSchemePreference()
    useStoreStorage()
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RootContextProps {
    children: React.ReactNode
    container: Container
}

export interface RootProps {
}

export interface RootIsolateProps {
}

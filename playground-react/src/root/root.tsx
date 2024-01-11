import '@eviljs/reactx/showcase-v1/showcase-theme-v1.css'

import {ContainerProvider} from '@eviljs/react/container'
import {I18nProvider} from '@eviljs/react/i18n'
import {Portal, PortalProvider} from '@eviljs/react/portal'
import {PortalsProvider} from '@eviljs/react/portals'
import {RouterProvider} from '@eviljs/react/router'
import {piping} from '@eviljs/std/pipe'
import type {Container} from '~/container/container-apis'
import {I18nSpec} from '~/i18n/i18n-apis'
import {RouterStatic} from '~/router/router-static'
import {useStoreStorage} from '~/store/store-hooks'
import {StoreSpec as StoreSpecV3} from '~/store/store-v3-apis'
import {StoreProvider as StoreProviderV3} from '~/store/store-v3-hooks'
import {useColorSchemePreference} from '~/theme/theme-hooks'

export function RootContext(props: RootContextProps) {
    const {children, container} = props
    const {Router} = container

    return piping(children)
        (it => ContainerProvider({children: it, value: container}))
        (it => I18nProvider({children: it, ...I18nSpec}))
        (it => PortalProvider({children: it}))
        (it => PortalsProvider({children: it}))
        (it => RouterProvider({children: it, router: Router}))
        (it => StoreProviderV3({children: it, ...StoreSpecV3}))
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

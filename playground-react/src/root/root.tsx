import '@eviljs/reactx/showcase-v1/showcase-theme-v1.css'

import {I18nProvider} from '@eviljs/react/i18n'
import {Portal, PortalProvider} from '@eviljs/react/portal'
import {PortalsProvider} from '@eviljs/react/portals'
import {RouterProvider} from '@eviljs/react/router'
import {piping} from '@eviljs/std/fn'
import type {MyContainer} from '~/container/container-apis'
import {MyContainerContext} from '~/container/container-hooks'
import {I18nSpec} from '~/i18n/i18n-apis'
import {RouterStatic} from '~/router/router-static'
import {MyStoreProvider as MyStoreProviderV3, MyStoreSpec as StoreSpecV3} from '~/store/store-v3'
import {useColorSchemePreference} from '~/theme/theme-hooks'

export function RootContext(props: RootContextProps) {
    const {children, container} = props
    const {Router} = container

    return piping(children)
        (it => MyContainerContext.Provider({children: it, value: container}))
        (it => I18nProvider({children: it, ...I18nSpec}))
        (it => PortalProvider({children: it}))
        (it => PortalsProvider({children: it}))
        (it => RouterProvider({children: it, router: Router}))
        (it => MyStoreProviderV3({children: it, ...StoreSpecV3}))
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
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RootContextProps {
    children: React.ReactNode
    container: MyContainer
}

export interface RootProps {
}

export interface RootIsolateProps {
}

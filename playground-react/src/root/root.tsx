import '@eviljs/reactx/showcase-v1/showcase-theme-v1.css'

import {Portal, PortalProvider} from '@eviljs/react/portal'
import {PortalsProvider} from '@eviljs/react/portals'
import {RouterProvider} from '@eviljs/react/router'
import {StyleProvider} from '@eviljs/react/style'
import {MessageProvider} from '@eviljs/react/message'
import {DemoBusProvider} from '~/bus/bus-hooks'
import type {DemoContainer} from '~/container/container-apis'
import {DemoContainerContext} from '~/container/container-hooks'
import {RouterStatic} from '~/router/router-static'
import {DemoStoreProvider, DemoStoreSpec} from '~/store/store'
import {useColorSchemePreference} from '~/theme/theme-hooks'
import {MsgSpec} from '~/message/message-specs'

export function RootContext(props: RootContextProps) {
    const {children, container} = props
    const {Router} = container

    return (
        <DemoContainerContext.Provider value={container}>
            <DemoStoreProvider {...DemoStoreSpec}>
                <DemoBusProvider>
                    <MessageProvider {...MsgSpec}>
                        <StyleProvider>
                            <RouterProvider router={Router}>
                                <PortalProvider>
                                    <PortalsProvider>
                                        {children}
                                    </PortalsProvider>
                                </PortalProvider>
                            </RouterProvider>
                        </StyleProvider>
                    </MessageProvider>
                </DemoBusProvider>
            </DemoStoreProvider>
        </DemoContainerContext.Provider>
    )
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
    container: DemoContainer
}

export interface RootProps {
}

export interface RootIsolateProps {
}

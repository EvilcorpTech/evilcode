import {setupContainer} from '@eviljs/react/container'
import type {DemoContainerServices, DemoContainerState} from './container-specs'

export type {DemoContainer} from './container-apis'

export const {
    ContainerContext: DemoContainerContext,
    ContainerProvider: DemoContainerProvider,
    useContainerContext: useDemoContainerContext,
    useContainerProvider: useDemoContainerProvider,
    useContainer: useDemoContainer,
} = setupContainer<DemoContainerServices, DemoContainerState>({ contextName: 'DemoContainerContext' })

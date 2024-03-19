import {setupContainer} from '@eviljs/react/container'
import type {MyContainerServices, MyContainerState} from './container-specs'

export type {MyContainer} from './container-apis'

export const {
    ContainerContext: MyContainerContext,
    ContainerProvider: MyContainerProvider,
    useContainerContext: useMyContainerContext,
    useContainerProvider: useMyContainerProvider,
    useContainer: useMyContainer,
  } = setupContainer<MyContainerServices, MyContainerState>({ contextName: 'MyContainerContext' })

import {createContainer, type Container as ContainerDefinition} from '@eviljs/std/container'
import {MyContainerSpec, type MyContainerServices, type MyContainerState} from './container-specs'

export function createMyContainer(state: MyContainerState): MyContainer {
    return createContainer(MyContainerSpec, state)
}

// Types ///////////////////////////////////////////////////////////////////////

export type MyContainer = ContainerDefinition<MyContainerServices, MyContainerState>

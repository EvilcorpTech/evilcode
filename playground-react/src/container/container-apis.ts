import {createContainer, type Container} from '@eviljs/std/container'
import {DemoContainerSpec, type DemoContainerServices, type DemoContainerState} from './container-specs'

export function createDemoContainer(state: DemoContainerState): DemoContainer {
    return createContainer(DemoContainerSpec, state)
}

// Types ///////////////////////////////////////////////////////////////////////

export type DemoContainer = Container<DemoContainerServices, DemoContainerState>

import {ensureDefined} from './type-ensure.js'

export const ContainerInternalsKey: unique symbol = Symbol('ContainerInternals')

/*
* Creates a container instance.
*
* EXAMPLE
*
* const services = {
*     MyService({MyDependency}) {
*         return MyService(MyDependency)
*     },
* }
*
* createContainer(services)
*/
export function createContainer<M extends ContainerServicesMap>(
    factories: ContainerFactoriesOf<M>,
    state?: undefined,
): Container<M, undefined>
export function createContainer<M extends ContainerServicesMap, S = undefined>(
    factories: ContainerFactoriesOf<M, S>,
    state: S,
): Container<M, S>
export function createContainer<M extends ContainerServicesMap, S = undefined>(
    factories: ContainerFactoriesOf<M, undefined | S>,
    state?: undefined | S,
): Container<M, undefined | S> {
    const self: Container<M, undefined | S> = {
        [ContainerInternalsKey]: {
            factories,
            instances: {} as M,
        },
        ...{} as M, // For typing purpose.

        state: state,

        require(...args) {
            return ensureDefined(requireContainerService(self, ...args))
        },
    }

    for (const serviceId of Reflect.ownKeys(factories)) {
        defineContainerService(self, serviceId as keyof M)
    }

    return self
}

export function getContainerInternals<M extends ContainerServicesMap, S>(container: Container<M, S>): ContainerInternals<M, S> {
    return container[ContainerInternalsKey]!
}

/**
* @throws
*
* Provides a service instance.
*
* EXAMPLE
*
* requireContainerService(container, 'MyService')
* requireContainerService(container, 'MyService', {type: 'prototype'})
*/
function defineContainerService<M extends ContainerServicesMap, S, I extends keyof M>(
    container: Container<M, S>,
    serviceId: I,
): void {
    // We define a proxy property that returns the service.
    Object.defineProperty(container, serviceId, {
        configurable: false,
        enumerable: true,
        get() {
            return requireContainerService(container, serviceId)
        },
    })
}

/**
* @throws
*
* Provides a service instance.
*
* EXAMPLE
*
* requireContainerService(container, 'MyService')
* requireContainerService(container, 'MyService', {type: 'prototype'})
*/
function requireContainerService<M extends ContainerServicesMap, S, I extends keyof M>(
    container: Container<M, S>,
    serviceId: I,
    options?: undefined | ContainerServiceOptions,
): M[I] {
    if (options?.type === 'prototype') {
        // A new instance is requested.
        return createContainerService(container, serviceId)
    }

    const ctx = getContainerInternals(container)

    // By default we use a singleton strategy.
    ctx.instances[serviceId] ??= createContainerService(container, serviceId)

    return ctx.instances[serviceId]
}

/*
* Provides an always new service instance.
* Same of `container.require(serviceId, {type: 'prototype'})`.
*
* EXAMPLE
*
* createContainerService(container, 'MyService')
* // is the same of
* requireContainerService(container, 'MyService', {type: 'prototype'})
*/
export function createContainerService<M extends ContainerServicesMap, S, I extends keyof M>(
    container: Container<M, S>,
    serviceId: I,
): M[I] {
    const ctx = getContainerInternals(container)
    const factory = ctx.factories[serviceId]
    return factory(container)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerServiceOptions {
    type?: undefined | 'prototype'
}

export type Container<M extends ContainerServicesMap = ContainerServicesMap, S = undefined> =
    & M
    & ContainerStateProps<S>
    & {
        [key: symbol]: ContainerInternals<M, S>
        /**
        * @throws InvalidInput
        */
        require<K extends keyof M>(id: K, options?: undefined | ContainerServiceOptions): M[K]
    }

export interface ContainerInternals<M extends ContainerServicesMap = ContainerServicesMap, S = undefined> {
    factories: ContainerFactoriesOf<M, S>
    instances: M
}

export interface ContainerStateProps<S> {
    readonly state: S
}

export type ContainerServiceId = PropertyKey
export type ContainerServicesMap = object

export type ContainerFactoriesOf<M extends ContainerServicesMap, S = undefined> = {
    [key in keyof M]: (container: Container<M, S>) => M[key]
}

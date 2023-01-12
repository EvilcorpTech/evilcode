import {ensureDefined} from './assert.js'

export const ContainerFactoriesKey = Symbol('ContainerFactories')
export const ContainerInstancesKey = Symbol('ContainerInstances')

/*
* Creates a container instance.
*
* EXAMPLE
*
* const services = {
*     MyService(container) {
*         const {MyDep: myDep} = container
*         return MyService(myDep)
*     },
* }
*
* createContainer(services)
*/
export function createContainer<F extends ContainerFactories>(
    factories: F,
    options?: undefined | ContainerOptions,
): Container<F> {
    const self: Container<F> = {
        ...{} as ContainerServicesOf<F>, // For typing purpose.

        [ContainerFactoriesKey]: {} as F,
        [ContainerInstancesKey]: {} as ContainerServicesOf<F>,

        require(...args) {
            return ensureDefined(requireService(self, ...args))
        },
        register(...args) {
            return registerService(self, ...args)
        },
    }

    if (factories) {
        for (const it of Object.entries(factories)) {
            const [id, factory] = it
            self.register(id, factory)
        }
        for (const id of Object.getOwnPropertySymbols(factories)) {
            const factory = factories[id]!
            self.register(id, factory)
        }
    }

    return self
}

/*
* Associates a factory function to an id, for later retrieval.
*
* EXAMPLE
*
* registerService(container, 'MyService', container => MyService())
* registerService(container, Symbol(), container => MyService())
*/
export function registerService<C extends Container>(
    container: C,
    serviceId: ServiceId,
    serviceFactory: ServiceFactory,
    options?: undefined | RequireContainerServiceOptions,
) {
    container[ContainerFactoriesKey][serviceId] = serviceFactory

    // We define a proxy property that returns the service.
    Object.defineProperty(container, serviceId, {
        get: () => ensureDefined(requireService(container, serviceId, options)),
        configurable: false,
        enumerable: true,
    })

    return container
}

/*
* Provides a service instance.
*
* EXAMPLE
*
* requireService(container, 'MyService')
* requireService(container, 'MyService', {type: 'prototype'})
*/
function requireService<T = unknown>(
    container: Container,
    serviceId: ServiceId,
    options?: undefined | RequireContainerServiceOptions,
): undefined | T {
    if (options?.type === 'prototype') {
        // A new instance is requested.
        return makeService(container, serviceId)
    }

    if (! container[ContainerInstancesKey][serviceId]) {
        // By default we use a singleton strategy.
        container[ContainerInstancesKey][serviceId] = makeService(container, serviceId)
    }

    return container[ContainerInstancesKey][serviceId]
}

/*
* Provides an always new service instance.
* Same of `container.require(serviceId, {type: 'prototype'})`.
*
* EXAMPLE
*
* makeService(container, 'MyService')
* // is the same of
* requireService(container, 'MyService', {type: 'prototype'})
*/
export function makeService<T = unknown>(container: Container, serviceId: ServiceId): undefined | T {
    const factory = container[ContainerFactoriesKey][serviceId]
    return factory?.(container)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerOptions {
}

export type Container<F extends ContainerFactories = ContainerFactories> = {
    [ContainerFactoriesKey]: F
    [ContainerInstancesKey]: ContainerServicesOf<F>
    /**
    * @throws InvalidInput
    */
    require: <T = unknown>(id: ServiceId) => T
    register: (id: ServiceId, service: ServiceFactory) => Container<F>
} & ContainerServicesOf<F>

export type ContainerFactories = Record<ServiceId, ServiceFactory>
export type ServiceId = PropertyKey
export type ServiceFactory = (container: any) => any

export type ContainerServicesOf<F extends ContainerFactories> = {
    [key in keyof F]: ReturnType<F[key]>
}

export interface RequireContainerServiceOptions {
    type?: undefined | 'prototype'
}

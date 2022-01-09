export const ContainerFactories = Symbol('ContainerFactories')
export const ContainerInstances = Symbol('ContainerInstances')

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
* createContainer({services})
*/
export function createContainer<F extends ContainerFactories>(spec?: ContainerSpec<F>) {
    const self: Container<F> = {
        ...spec?.services as ContainerServicesOf<F>, // TypeScript ugliness.

        [ContainerFactories]: {} as F,
        [ContainerInstances]: {} as ContainerServicesOf<F>,
        require(...args) {
            return requireService(self, ...args)
        },
        register(...args) {
            return registerService(self, ...args)
        },
    }

    if (spec?.services) {
        const factories = spec.services
        const services = [
            ...Object.entries(factories),
            ...Object.getOwnPropertySymbols(factories).reduce((list, id) => {
                const factory = factories[id as unknown as string]!

                list.push([id as unknown as string, factory])

                return list
            }, [] as Array<[string, ServiceFactory]>),
        ]

        services.forEach(([ id, factory ]) =>
            self.register(id, factory)
        )
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
export function registerService
    <C extends Container>
    (container: C, serviceId: ServiceId, serviceFactory: ServiceFactory)
{
    container[ContainerFactories][serviceId as string] = serviceFactory

    // We define a proxy property that returns the service.
    Object.defineProperty(container, serviceId, {
        get() {
            return container.require(serviceId)
        },
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
function requireService(container: Container, serviceId: ServiceId, options?: RequireServiceOptions) {
    if (options?.type === 'prototype') {
        // User requested a new instance.
        return makeService(container, serviceId)
    }

    if (! container[ContainerInstances][serviceId as string]) {
        // By default we use a singleton strategy.
        container[ContainerInstances][serviceId as string] = makeService(container, serviceId)
    }

    return container[ContainerInstances][serviceId as string]
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
export function makeService(container: Container, serviceId: ServiceId) {
    const serviceFactory = container[ContainerFactories][serviceId as string]

    if (! serviceFactory) {
        return
    }

    // We bind the factory to the container instance passing as first
    // argument the container supporting factories defined as arrow functions.
    const serviceInstance = serviceFactory(container)

    return serviceInstance
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerSpec<F extends ContainerFactories> {
    services?: F
}

export type Container<F extends ContainerFactories = ContainerFactories> = {
    [ContainerFactories]: F
    [ContainerInstances]: ContainerServicesOf<F>
    require: <T = unknown>(id: ServiceId) => T
    register: (id: ServiceId, service: ServiceFactory) => Container<F>
} & ContainerServicesOf<F>

export type ContainerFactories = Record<ServiceId, ServiceFactory>
export type ServiceId = string | number | symbol
export type ServiceFactory = (container: any) => any

export type ContainerServicesOf<F extends ContainerFactories> = {
    [key in keyof F]: ReturnType<F[key]>
}

export interface RequireServiceOptions {
    type?: 'prototype'
}

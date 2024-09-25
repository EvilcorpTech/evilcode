import {createContainer, type Container, type ContainerFactoriesOf, type ContainerServicesMap} from '@eviljs/std/container'
import {useContext, useMemo} from 'react'
import {defineContext} from './ctx.js'

export {createContainer, type ContainerServiceOptions, type ContainerStateProps} from '@eviljs/std/container'

export function setupContainer<M extends ContainerServicesMap, S = undefined>(
    options: ContainerBoundCase1Options<M, S>,
): ContainerBoundCase1Exports<M, S>
export function setupContainer<M extends ContainerServicesMap, S = undefined>(
    options?: undefined | ContainerBoundCase2Options<M, S>,
): ContainerBoundCase2Exports<M, S>
export function setupContainer<M extends ContainerServicesMap, S = undefined>(
    options?: undefined | ContainerBoundCase1Options<M, S> | ContainerBoundCase2Options<M, S>,
): ContainerBoundCase1Exports<M, S> | ContainerBoundCase2Exports<M, S> {
    if (options && 'container' in options) {
        return setupContainerUsingSingleton(options)
    }
    return setupContainerUsingContext(options)
}

export function setupContainerUsingSingleton<M extends ContainerServicesMap, S = undefined>(
    options: ContainerBoundCase1Options<M, S>,
): ContainerBoundCase1Exports<M, S> {
    const {container} = options

    return {
        useContainer() {
            return container
        },
    }
}

export function setupContainerUsingContext<M extends ContainerServicesMap, S = undefined>(
    options?: undefined | ContainerBoundCase2Options<M, S>,
): ContainerBoundCase2Exports<M, S> {
    const Context = options?.context ?? defineContext<Container<M, S>>(options?.contextName ?? 'ContainerContext')

    return {
        ContainerContext: Context,
        ContainerProvider(props) {
            return (
                <Context.Provider value={useContainerProvider(props)}>
                    {props.children}
                </Context.Provider>
            )
        },
        useContainerContext() {
            return useContext(Context)
        },
        useContainerProvider: useContainerProvider,
        useContainer() {
            return useContext(Context)!
        },
    }
}

export function useContainerProvider<M extends ContainerServicesMap, S = undefined>(
    options: ContainerDefinition<M, S>,
): Container<M, S> {
    const container = useMemo(() => {
        return createContainer<M, S>(options.services, options.state)
    }, [])

    return container
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerBoundCase1Options<M extends ContainerServicesMap, S = undefined> {
    container: Container<M, S>
}
export interface ContainerBoundCase1Exports<M extends ContainerServicesMap, S = undefined> {
    useContainer: {
        (): Container<M, S>
    }
}

export interface ContainerBoundCase2Options<M extends ContainerServicesMap, S = undefined> {
    context?: undefined | React.Context<undefined | Container<M, S>>
    contextName?: undefined | string
}
export interface ContainerBoundCase2Exports<M extends ContainerServicesMap, S = undefined> extends ContainerBoundCase1Exports<M, S> {
    ContainerContext: React.Context<undefined | Container<M, S>>
    ContainerProvider: {
        (props: {children: React.ReactNode} & ContainerDefinition<M, S>): JSX.Element
    },
    useContainerContext: {
        (): undefined | Container<M, S>
    }
    useContainerProvider: {
        (props: ContainerDefinition<M, S>): Container<M, S>
    }
}

export interface ContainerDefinition<M extends ContainerServicesMap, S = undefined> {
    services: ContainerFactoriesOf<M, S>
    state: S
}

import type {Io} from '@eviljs/std/fn.js'
import type {ReactiveAccessor} from '@eviljs/std/reactive-accessor.js'
import {identity, returnUndefined} from '@eviljs/std/return.js'
import {useMemo} from 'react'
import {useReactiveObservable, useReactiveObservables, useReactiveStore} from './reactive.js'
import type {StateManager} from './state.js'

const noopWatch = () => () => {}

export function useReactiveAccessor<V>(reactiveAccessor: ReactiveAccessor<V>): StateManager<V>
export function useReactiveAccessor<V>(reactiveAccessor: undefined | ReactiveAccessor<V>): StateManager<undefined | V>
export function useReactiveAccessor<V>(reactiveAccessor: undefined | ReactiveAccessor<V>): StateManager<undefined | V> {
    return useReactiveStore(
        reactiveAccessor?.read ?? returnUndefined,
        reactiveAccessor?.write ?? identity,
        reactiveAccessor?.watch ?? noopWatch,
    )
}

export function useReactiveAccessors<V>(reactiveAccessors: Array<ReactiveAccessor<V>>): Array<ReactiveAccessor<V>> {
    const signal = useReactiveObservables(reactiveAccessors)

    const values = useMemo(() => {
        return reactiveAccessors.slice()
    }, [reactiveAccessors, signal])

    return values
}

export function useReactiveAccessorsValues<V>(reactiveAccessors: Array<ReactiveAccessor<V>>): Array<V> {
    const signal = useReactiveObservables(reactiveAccessors)

    const values = useMemo(() => {
        return reactiveAccessors.map(it => it.read())
    }, [reactiveAccessors, signal])

    return values
}

export function useComputedAccessorValue<V, R>(reactiveAccessor: ReactiveAccessor<V>, computer: Io<V, R>): R
export function useComputedAccessorValue<V, R>(reactiveAccessor: undefined | ReactiveAccessor<V>, computer: Io<undefined | V, R>): undefined | R
export function useComputedAccessorValue<V, R>(reactiveAccessor: undefined | ReactiveAccessor<V>, computer: Io<undefined | V, R>): undefined | R {
    const signal = useReactiveObservable(reactiveAccessor)

    const computedValue = useMemo(() => {
        return computer(reactiveAccessor?.read())
    }, [reactiveAccessor, computer, signal])

    return computedValue
}

import {compute} from '@eviljs/std/compute.js'
import type {ReactiveAccessor, ReactiveObservable, ReactiveRef} from '@eviljs/std/reactive.js'
import {identity, returnUndefined} from '@eviljs/std/return.js'
import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
import {useRenderSignal, type RenderSignal} from './lifecycle.js'
import type {StateManager, StateSetterArg} from './state.js'

const noopWatch = () => () => {}

export function useReactiveStore<V>(
    read: ReactiveAccessor<V>['read'],
    write: ReactiveAccessor<V>['write'],
    watch: ReactiveAccessor<V>['watch'],
): StateManager<V> {
    const [value, setValue] = useState(read())

    const setReactiveValue = useCallback((value: StateSetterArg<V>) => {
        const valueComputed = compute(value, read())

        setValue(valueComputed)
        write(valueComputed)
    }, [read, write])

    useEffect(() => {
        setValue(read())

        const stopWatching = watch((newValue, oldValue) => {
            setValue(newValue)
        })

        function onClean() {
            stopWatching()
        }

        return onClean
    }, [watch])

    return [value, setReactiveValue]
}

export function useReactiveAccessor<V>(reactiveAccessor: ReactiveAccessor<V>): StateManager<V>
export function useReactiveAccessor<V>(reactiveAccessor: undefined | ReactiveAccessor<V>): StateManager<undefined | V>
export function useReactiveAccessor<V>(reactiveAccessor: undefined | ReactiveAccessor<V>): StateManager<undefined | V> {
    return useReactiveStore(
        reactiveAccessor?.read ?? returnUndefined,
        reactiveAccessor?.write ?? identity,
        reactiveAccessor?.watch ?? noopWatch,
    )
}

export function useReactiveRef<V>(reactiveRef: ReactiveRef<V>): StateManager<V>
export function useReactiveRef<V>(reactiveRef: undefined | ReactiveRef<V>): StateManager<undefined | V>
export function useReactiveRef<V>(reactiveRef: undefined | ReactiveRef<V>): StateManager<undefined | V> {
    const read = useCallback((): undefined | V => {
        return reactiveRef?.value
    }, [reactiveRef])

    const write = useCallback((value: V): undefined | V => {
        if (reactiveRef) {
            reactiveRef.value = value
        }
        return reactiveRef?.value
    }, [reactiveRef])

    return useReactiveStore(
        read,
        write,
        reactiveRef?.watch ?? noopWatch,
    )
}

export function useReactiveObservables<V>(reactiveObservables: Array<ReactiveObservable<V>>): RenderSignal {
    const [signal, notifySignal] = useRenderSignal()

    // We use useLayoutEffect, instead of useEffect, to start watching the observables
    // as soon as possible, avoiding missed notifications.
    useLayoutEffect(() => {
        const watchers = reactiveObservables.map(it => it.watch(notifySignal))

        function onClean() {
            watchers.forEach(stopWatching => stopWatching())
        }

        return onClean
    }, [reactiveObservables])

    return signal
}

export function useReactiveAccessors<V>(reactiveAccessors: Array<ReactiveAccessor<V>>): Array<ReactiveAccessor<V>> {
    const signal = useReactiveObservables(reactiveAccessors)

    const values = useMemo(() => {
        return reactiveAccessors.slice()
    }, [reactiveAccessors, signal])

    return values
}

export function useReactiveRefs<V>(reactiveRefs: Array<ReactiveRef<V>>): Array<ReactiveRef<V>> {
    const signal = useReactiveObservables(reactiveRefs)

    const values = useMemo(() => {
        return reactiveRefs.slice()
    }, [reactiveRefs, signal])

    return values
}

export function useReactiveAccessorsValues<V>(reactiveAccessors: Array<ReactiveAccessor<V>>): Array<V> {
    const signal = useReactiveObservables(reactiveAccessors)

    const values = useMemo(() => {
        return reactiveAccessors.map(it => it.read())
    }, [reactiveAccessors, signal])

    return values
}

export function useReactiveRefsValues<V>(reactiveRefs: Array<ReactiveRef<V>>): Array<V> {
    const signal = useReactiveObservables(reactiveRefs)

    const values = useMemo(() => {
        return reactiveRefs.map(it => it.value)
    }, [reactiveRefs, signal])

    return values
}

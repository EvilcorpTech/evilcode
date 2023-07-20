import {compute} from '@eviljs/std/compute.js'
import type {ReactiveAccessor, ReactiveRef} from '@eviljs/std/reactive.js'
import {identity, returnUndefined} from '@eviljs/std/return.js'
import {useCallback, useEffect, useState} from 'react'
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

export function useReactiveAccessor<V>(reactiveValue: ReactiveAccessor<V>): StateManager<V>
export function useReactiveAccessor<V>(reactiveValue: undefined | ReactiveAccessor<V>): StateManager<undefined | V>
export function useReactiveAccessor<V>(reactiveValue: undefined | ReactiveAccessor<V>): StateManager<undefined | V> {
    return useReactiveStore(
        reactiveValue?.read ?? returnUndefined,
        reactiveValue?.write ?? identity,
        reactiveValue?.watch ?? noopWatch,
    )
}

export function useReactiveRef<V>(reactiveValue: ReactiveRef<V>): StateManager<V>
export function useReactiveRef<V>(reactiveValue: undefined | ReactiveRef<V>): StateManager<undefined | V>
export function useReactiveRef<V>(reactiveValue: undefined | ReactiveRef<V>): StateManager<undefined | V> {
    const read = useCallback((): undefined | V => {
        return reactiveValue?.value
    }, [reactiveValue])

    const write = useCallback((value: V): undefined | V => {
        if (reactiveValue) {
            reactiveValue.value = value
        }
        return reactiveValue?.value
    }, [reactiveValue])

    return useReactiveStore(
        read,
        write,
        reactiveValue?.watch ?? noopWatch,
    )
}

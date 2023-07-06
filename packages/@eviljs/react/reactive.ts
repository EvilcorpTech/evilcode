import {compute} from '@eviljs/std/compute.js'
import {makeReactive, type ReactiveValue} from '@eviljs/std/reactive.js'
import {useCallback, useEffect, useMemo, useState} from 'react'
import type {StateManager, StateSetterArg} from './state.js'

export function useReactive<V>(reactiveValue: ReactiveValue<V>): StateManager<V>
export function useReactive<V>(reactiveValue: undefined | ReactiveValue<V>): StateManager<undefined | V>
export function useReactive<V>(reactiveValue: undefined | ReactiveValue<V>): StateManager<undefined | V> {
    const [value, setValue] = useState(reactiveValue?.read())

    const setReactiveValue = useCallback((value: StateSetterArg<undefined | V>) => {
        if (! reactiveValue) {
            return
        }

        const valueComputed = compute(value, reactiveValue.read())

        setValue(valueComputed)
    }, [reactiveValue])

    useEffect(() => {
        if (! reactiveValue) {
            return
        }

        setValue(reactiveValue.read())

        const stopWatching = reactiveValue.watch((newValue, oldValue) => {
            setValue(newValue)
        })

        function onClean() {
            stopWatching()
        }

        return onClean
    }, [reactiveValue])

    return [value, setReactiveValue]
}

export function useReactiveValue<V>(value: V): StateManager<V> {
    const reactiveValue = useMemo(() => {
        return makeReactive(value)
    }, [])

    return useReactive(reactiveValue)
}

import type {ReactiveRef} from '@eviljs/std/reactive-ref.js'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {useReactiveObservable, useReactiveObservables, useReactiveStore} from './reactive.js'
import type {StateManager} from './state.js'
import type {Io} from '@eviljs/std/fn.js'

const noopWatch = () => () => {}

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

export function useReactiveRefs<V>(reactiveRefs: Array<ReactiveRef<V>>): Array<ReactiveRef<V>> {
    const signal = useReactiveObservables(reactiveRefs)

    const values = useMemo(() => {
        return reactiveRefs.slice()
    }, [reactiveRefs, signal])

    return values
}

export function useReactiveRefsValues<V>(reactiveRefs: Array<ReactiveRef<V>>): Array<V> {
    const signal = useReactiveObservables(reactiveRefs)

    const values = useMemo(() => {
        return reactiveRefs.map(it => it.value)
    }, [reactiveRefs, signal])

    return values
}

export function useComputedRefValue<V, R>(reactiveRef: ReactiveRef<V>, computer: Io<V, R>): R
export function useComputedRefValue<V, R>(reactiveRef: undefined | ReactiveRef<V>, computer: Io<undefined | V, R>): undefined | R
export function useComputedRefValue<V, R>(reactiveRef: undefined | ReactiveRef<V>, computer: Io<undefined | V, R>): undefined | R {
    const signal = useReactiveObservable(reactiveRef)

    const computedValue = useMemo(() => {
        return computer(reactiveRef?.value)
    }, [reactiveRef, computer, signal])

    return computedValue
}

export function useSelectedRefValue<V, R>(reactiveRef: ReactiveRef<V>, selector: Io<V, R>): R
export function useSelectedRefValue<V, R>(reactiveRef: undefined | ReactiveRef<V>, selector: Io<undefined | V, R>): undefined | R
export function useSelectedRefValue<V, R>(reactiveRef: undefined | ReactiveRef<V>, selector: Io<undefined | V, R>): undefined | R {
    const selectedValue = selector(reactiveRef?.value)
    const [signal, setSignal] = useState(selectedValue)

    useEffect(() => {
        if (! reactiveRef) {
            return
        }

        const stopWatching = reactiveRef.watch(
            newValue => setSignal(selector(newValue)),
            {immediate: true},
        )

        function onClean() {
            stopWatching()
        }

        return onClean
    }, [reactiveRef, selector])

    return selectedValue
}

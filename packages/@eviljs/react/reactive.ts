import type {AccessorSync} from '@eviljs/std/accessor.js'
import {call, compute} from '@eviljs/std/fn.js'
import type {ReactiveObservable} from '@eviljs/std/reactive.js'
import {useCallback, useEffect, useLayoutEffect, useState} from 'react'
import {useRenderSignal, type RenderSignal} from './render.js'
import type {StateManager, StateSetterArg} from './state.js'

export function useReactiveStore<V>(
    read: AccessorSync<V>['read'],
    write: AccessorSync<V>['write'],
    watch: ReactiveObservable<V>['watch'],
): StateManager<V> {
    const [value, setValue] = useState(read())

    const setReactiveValue = useCallback((value: StateSetterArg<V>) => {
        const valueComputed = compute(value, read())

        setValue(valueComputed)
        write(valueComputed)
    }, [read, write])

    useEffect(() => {
        const onClean = watch(setValue, {immediate: true})

        return onClean
    }, [watch])

    return [value, setReactiveValue]
}

export function useReactiveObservable<V>(reactiveObservable: undefined | ReactiveObservable<V>): RenderSignal {
    const [signal, notifySignal] = useRenderSignal()

    // We use useLayoutEffect (instead of useEffect) to watch the observable
    // as soon as possible, avoiding missed notifications.
    useLayoutEffect(() => {
        const onClean = reactiveObservable?.watch(notifySignal)

        return onClean
    }, [reactiveObservable])

    return signal
}

export function useReactiveObservables<V>(reactiveObservables: Array<ReactiveObservable<V>>): RenderSignal {
    const [signal, notifySignal] = useRenderSignal()

    // We use useLayoutEffect (instead of useEffect) to watch the observables
    // as soon as possible, avoiding missed notifications.
    useLayoutEffect(() => {
        const cleaningTasks = reactiveObservables.map(it => it.watch(notifySignal))

        function onClean() {
            cleaningTasks.forEach(call)
        }

        return onClean
    }, [reactiveObservables])

    return signal
}

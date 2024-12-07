import {scheduleMicroTask} from './eventloop.js'
import type {Task} from './fn-type.js'
import {areEqualIdentity} from './struct.js'

export const ReactiveStateSymbol: unique symbol = Symbol('ReactiveState')

export function createReactive<V>(
    value: V,
    options?: undefined | ReactiveOptions<NoInfer<V>>,
): ReactiveProtocol<V> {
    return {
        [ReactiveStateSymbol]: {
            value: value,
            comparator: options?.equals ?? areEqualIdentity,
            middleware: options?.middleware,
            observers: new Set<ReactiveObserver<V>>(),
            notification: undefined,
        },
    }
}

export function getReactiveState<V>(reactive: ReactiveProtocol<V>): ReactiveState<V> {
    return reactive[ReactiveStateSymbol]!
}

export function readReactive<V>(reactive: ReactiveProtocol<V>): V {
    return getReactiveState(reactive).value
}

export function writeReactive<V>(reactive: ReactiveProtocol<V>, value: V): V {
    const state = getReactiveState(reactive)
    const areEqual = state.comparator

    if (areEqual(state.value, value)) {
        return state.value
    }

    const middleware = state.middleware
    const newValue = middleware
        ? middleware(value, state.value)
        : value

    if (areEqual(state.value, newValue)) {
        return state.value
    }

    const previousNotifiedValue = state.value
    state.value = newValue

    // We notify once multiple mutations in the same micro task.
    // We schedule a micro task so that if an observer triggers a value mutation,
    // the reentrant mutation is notified after current one is notified.
    state.notification ??= scheduleMicroTask(() => {
        state.notification = undefined

        if (areEqual(state.value, previousNotifiedValue)) {
            // Multiple mutations in the same batch can result in the end value
            // as the initial one.
            // EXAMPLE
            // value = 0; write(1); write(0);
            // No notification is needed in this case.
            return
        }

        // We use a stable value as notified value, instead of state.value,
        // because an observer could change state.value as response to a notification.
        // In this way all observers are notified with a coherent value.
        const notifiedValue = state.value

        for (const it of state.observers) {
            it(notifiedValue, previousNotifiedValue)
        }
    })

    return state.value
}

export function watchReactive<V>(
    reactive: ReactiveProtocol<V>,
    observer: ReactiveObserver<V>,
    options?: undefined | ReactiveWatchOptions,
): Task {
    const state = getReactiveState(reactive)
    const {observers} = state
    const immediate = options?.immediate ?? false

    observers.add(observer)

    if (immediate) {
        observer(state.value, state.value)
    }

    function stop() {
        observers.delete(observer)
    }

    return stop
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveProtocol<V> {
    [key: symbol]: ReactiveState<V>
}

export interface ReactiveState<V> {
    value: V
    readonly comparator: ReactiveComparator<V>
    readonly middleware: undefined | ReactiveMiddleware<V>
    readonly observers: Set<ReactiveObserver<V>>
    notification: undefined | Task
}

export type ReactiveMiddleware<V> = (newValue: V, oldValue: V) => V
export type ReactiveObserver<V> = (newValue: V, oldValue: V) => void
export type ReactiveComparator<V> = (oldValue: V, newValue: V) => boolean

export interface ReactiveOptions<V> {
    equals?: undefined | ReactiveComparator<V>
    middleware?: undefined | ReactiveMiddleware<V>
}

export interface ReactiveWatchOptions {
    immediate?: undefined | boolean
}

export type ReactiveValueOf<R extends ReactiveProtocol<any>> =
    R extends ReactiveProtocol<infer V>
        ? V
        : never

export type ReactiveValuesOf<A extends Array<ReactiveProtocol<any>>> =
    {[key in keyof A]: ReactiveValueOf<A[key]>}

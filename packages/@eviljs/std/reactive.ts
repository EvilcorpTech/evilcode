import {createAccessor, type AccessorSync} from './accessor.js'
import {scheduleMicroTask} from './eventloop.js'
import type {TaskVoid} from './fn.js'
import {areEqualIdentity} from './struct.js'

export function makeReactive<V>(initialValue: V, options?: undefined | ReactiveValueOptions<V>): ReactiveValue<V> {
    let currentValue = initialValue
    let cancelNotification: undefined | TaskVoid = undefined
    const observers: Set<ReactiveValueObserver<V>> = new Set()
    const areEqual = options?.equals ?? areEqualIdentity

    function read(): V {
        return currentValue
    }

    function write(newValue: V): V {
        if (areEqual(currentValue, newValue)) {
            return currentValue
        }

        const oldValue = currentValue
        currentValue = newValue

        // We notify once multiple mutations in the same micro task.
        // We schedule a micro task so that if an observer triggers a value mutation,
        // the reentrant mutation is notified after current one is notified.
        cancelNotification ??= scheduleMicroTask(() => {
            cancelNotification = undefined

            if (areEqual(currentValue, oldValue)) {
                return
            }

            for (const it of observers) {
                it(currentValue, oldValue)
            }
        })

        return newValue
    }

    return {
        ...createAccessor(read, write),
        watch(observer, options) {
            const immediate = options?.immediate ?? false

            observers.add(observer)

            if (immediate) {
                observer(currentValue, currentValue)
            }

            function stop() {
                observers.delete(observer)
            }

            return stop
        },
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveValue<V> extends AccessorSync<V> {
    watch(observer: ReactiveValueObserver<V>, options?: undefined | ReactiveWatchOptions): TaskVoid
}

export interface ReactiveValueOptions<V> {
    equals?: undefined | ReactiveValueComparator<V>
}

export interface ReactiveValueObserver<V> {
    (newValue: V, oldValue: V): void
}

export interface ReactiveValueComparator<V> {
    (oldValue: V, newValue: V): boolean
}

export interface ReactiveWatchOptions {
    immediate?: undefined | boolean
}

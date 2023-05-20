import {createAccessor, type AccessorSync} from './accessor.js'
import {scheduleMicroTask} from './eventloop.js'
import type {TaskVoid} from './fn.js'
import {areEqualIdentity} from './struct.js'

export function makeReactive<V>(initialValue: V, options?: undefined | ReactiveValueOptions<V>): ReactiveValue<V> {
    let value = initialValue
    let cancelNotification: undefined | TaskVoid = undefined
    const observers: Set<ReactiveValueObserver<V>> = new Set()
    const areEqual = options?.equals ?? areEqualIdentity

    function read(): V {
        return value
    }

    function write(newValue: V): V {
        const oldValue = value

        if (areEqual(oldValue, newValue)) {
            return value
        }

        value = newValue

        // We notify once multiple mutations in the same micro task.
        // We schedule a micro task so that if an observer triggers a value mutation,
        // the reentrant mutation is notified after current one is notified.
        cancelNotification ??= scheduleMicroTask(() => {
            cancelNotification = undefined

            for (const it of observers) {
                it(newValue, oldValue)
            }
        })

        return newValue
    }

    return {
        ...createAccessor(read, write),
        get value() {
            return value
        },
        set value(newValue) {
            write(newValue)
        },
        watch(observer, options) {
            const immediate = options?.immediate ?? false

            observers.add(observer)

            if (immediate) {
                observer(value, value)
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

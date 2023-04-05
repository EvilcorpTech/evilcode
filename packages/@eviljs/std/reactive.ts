import {createAccessor, type AccessorSync} from './accessor.js'
import {areEqualIdentity} from './equal.js'
import {scheduleMicroTask} from './eventloop.js'
import type {TaskVoid} from './fn.js'

export function makeReactive<T>(initialValue: T, options?: undefined | ReactiveValueOptions<T>): ReactiveValue<T> {
    let value = initialValue
    let cancelNotification: undefined | TaskVoid = undefined
    const observers: Set<ReactiveValueObserver<T>> = new Set()
    const areEqual = options?.equals ?? areEqualIdentity

    function read(): T {
        return value
    }

    function write(newValue: T): T {
        const oldValue = value

        if (areEqual(oldValue, newValue)) {
            return value
        }

        value = newValue

        // Notifies once multiple mutations in the same micro task.
        cancelNotification?.()

        // We schedule a micro task so that if the observer triggers a value mutation,
        // the reentrant mutation is notified after current one is notified.
        cancelNotification = scheduleMicroTask(() => {
            for (const it of observers) {
                it(newValue, oldValue)
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

export interface ReactiveValue<T> extends AccessorSync<T> {
    watch(observer: ReactiveValueObserver<T>, options?: undefined | ReactiveWatchOptions): TaskVoid
}

export interface ReactiveValueOptions<T> {
    equals?: undefined | ReactiveValueComparator<T>
}

export interface ReactiveValueObserver<T> {
    (newValue: T, oldValue: T): void
}

export interface ReactiveValueComparator<T> {
    (oldValue: T, newValue: T): boolean
}

export interface ReactiveWatchOptions {
    immediate?: undefined | boolean
}

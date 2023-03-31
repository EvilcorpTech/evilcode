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
        if (areEqual(value, newValue)) {
            return newValue
        }

        value = newValue

        // Notifies once multiple mutations in the same micro task.
        cancelNotification?.()

        // We schedule a micro task so that if the observer triggers a value mutation,
        // the reentrant mutation is notified after current one is notified.
        cancelNotification = scheduleMicroTask(() => {
            for (const it of observers) {
                it(newValue)
            }
        })

        return newValue
    }

    return {
        ...createAccessor(read, write),
        subscribe(observer: ReactiveValueObserver<T>): TaskVoid {
            observers.add(observer)

            observer(value)

            function stop() {
                observers.delete(observer)
            }

            return stop
        },
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveValue<T> extends AccessorSync<T> {
    subscribe(observer: ReactiveValueObserver<T>): TaskVoid
}

export interface ReactiveValueOptions<T> {
    equals?: undefined | ReactiveValueComparator<T>
}

export interface ReactiveValueObserver<T> {
    (value: T): void
}

export interface ReactiveValueComparator<T> {
    (oldValue: T, newValue: T): boolean
}

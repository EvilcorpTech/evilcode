import type {CancelTask} from './eventloop.js'
import {scheduleMicroTask} from './eventloop.js'

export function makeReactive<T>(initialValue: T, options?: undefined | ReactiveValueOptions<T>): ReactiveValue<T> {
    let value = initialValue
    let cancelNotification: undefined | CancelTask = undefined
    const observers: Set<ReactiveValueObserver<T>> = new Set()
    const areEqual = options?.equals ?? areEqualIdentity

    return {
        get value(): T {
            return value
        },
        set value(newValue: T) {
            if (areEqual(value, newValue)) {
                return
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
        },
        subscribe(observer: ReactiveValueObserver<T>): UnobserveReactiveValue {
            observers.add(observer)

            observer(value)

            function stop() {
                observers.delete(observer)
            }

            return stop
        },
    }
}

export function areEqualIdentity<T>(oldValue: T, newValue: T) {
    return oldValue === newValue
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveValue<T> {
    value: T
    subscribe(observer: ReactiveValueObserver<T>): UnobserveReactiveValue
}

export interface ReactiveValueOptions<T> {
    equals?: undefined | ReactiveValueComparator<T>
}

export interface ReactiveValueObserver<T> {
    (value: T): void
}

export interface UnobserveReactiveValue extends CancelTask {
}

export interface ReactiveValueComparator<T> {
    (oldValue: T, newValue: T): boolean
}

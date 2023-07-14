import {createAccessor, type AccessorSync} from './accessor.js'
import {scheduleMicroTask} from './eventloop.js'
import type {TaskVoid} from './fn.js'
import type {Ref} from './ref.js'
import {areEqualIdentity} from './struct.js'

export function createReactiveAccessor<V>(initialValue: V, options?: undefined | ReactiveOptions<V>): ReactiveAccessor<V> {
    let currentValue = initialValue
    let cancelNotification: undefined | TaskVoid = undefined
    const observers: Set<ReactiveObserver<V>> = new Set()
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

    const accessor = createAccessor(read, write)

    return {
        read: accessor.read,
        write: accessor.write,
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

export function createReactiveRef<V>(initialValue: V, options?: undefined | ReactiveOptions<V>): ReactiveRef<V> {
    const reactiveAccessor = createReactiveAccessor(initialValue, options)

    return {
        get value() {
            return reactiveAccessor.read()
        },
        set value(value) {
            reactiveAccessor.write(value)
        },
        watch: reactiveAccessor.watch,
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveAccessor<V> extends AccessorSync<V>, ReactiveObservable<V> {
}

export interface ReactiveRef<V> extends Ref<V>, ReactiveObservable<V> {
}

export interface ReactiveObservable<V> {
    watch(observer: ReactiveObserver<V>, options?: undefined | ReactiveWatchOptions): TaskVoid
}

export interface ReactiveOptions<V> {
    equals?: undefined | ReactiveComparator<V>
}

export interface ReactiveWatchOptions {
    immediate?: undefined | boolean
}

export interface ReactiveObserver<V> {
    (newValue: V, oldValue: V): void
}

export interface ReactiveComparator<V> {
    (oldValue: V, newValue: V): boolean
}

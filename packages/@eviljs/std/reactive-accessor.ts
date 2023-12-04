import {createAccessor, type AccessorSync} from './accessor.js'
import {scheduleMicroTaskUsingPromise} from './eventloop.js'
import type {Task} from './fn.js'
import type {ReactiveComputed, ReactiveInternals, ReactiveObservable, ReactiveObserver, ReactiveOptions, ReactiveWatchOptions} from './reactive.js'
import {areEqualIdentity} from './struct.js'

export function createReactiveAccessor<V>(
    initialValue: V,
    options?: undefined | ReactiveOptions<V>,
): ReactiveAccessor<V> {
    let currentValue = initialValue
    let cancelNotification: undefined | Task = undefined
    const observers: ReactiveInternals<V>['__observers__'] = new Set()
    const areEqual = options?.equals ?? areEqualIdentity

    const accessor = createAccessor(read, write)

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
        cancelNotification ??= scheduleMicroTaskUsingPromise(() => {
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

    function watch(observer: ReactiveObserver<V>, options?: undefined | ReactiveWatchOptions): Task {
        const immediate = options?.immediate ?? false

        observers.add(observer)

        if (immediate) {
            observer(currentValue, currentValue)
        }

        function stop() {
            observers.delete(observer)
        }

        return stop
    }

    return {
        __observers__: observers,
        read: accessor.read,
        write: accessor.write,
        watch,
    }
}

export function createComputedAccessor<A extends Array<ReactiveAccessor<any>>, R>(
    accessors: readonly [...A],
    computer: (...args: ReactiveAccessorValuesOf<A>) => R,
): ReactiveComputedAccessor<R> {
    function compute() {
        const computerArg = accessors.map(it => it.read()) as ReactiveAccessorValuesOf<A>
        const computedValue = computer(...computerArg)
        return computedValue
    }

    const reactiveAccessor = createReactiveAccessor(compute())

    const cleanUpList = accessors.map(ref =>
        // We watch every accessor...
        ref.watch(() =>
            // ...and every time an accessor changes, we update the computed value.
            reactiveAccessor.write(compute())
        )
    )

    function clean() {
        cleanUpList.forEach(clean => clean())
    }

    return {
        __observers__: reactiveAccessor.__observers__,
        read: reactiveAccessor.read,
        write: reactiveAccessor.write,
        watch: reactiveAccessor.watch,
        clean,
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveAccessor<V> extends AccessorSync<V>, ReactiveObservable<V>, ReactiveInternals<V> {
}

export interface ReactiveComputedAccessor<V> extends ReactiveAccessor<V>, ReactiveComputed {
}

export type ReactiveAccessorValueOf<R extends ReactiveAccessor<any>> =
    R extends ReactiveAccessor<infer V>
        ? V
        : never

export type ReactiveAccessorValuesOf<A extends Array<ReactiveAccessor<any>>> =
    {[key in keyof A]: ReactiveAccessorValueOf<A[key]>}

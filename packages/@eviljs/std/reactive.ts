import {createAccessor, type AccessorSync} from './accessor.js'
import {scheduleMicroTaskUsingPromise} from './eventloop.js'
import type {FnArgs, Task} from './fn.js'
import type {Ref} from './ref.js'
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

export function createReactiveRef<V>(
    initialValue: V,
    options?: undefined | ReactiveOptions<V>,
): ReactiveRef<V> {
    const reactiveAccessor = createReactiveAccessor(initialValue, options)

    // Resolves accessors props for fast access inside getter and setter functions.
    const {read, write} = reactiveAccessor

    return {
        __observers__: reactiveAccessor.__observers__,
        get value() {
            return read()
        },
        set value(value) {
            write(value)
        },
        watch: reactiveAccessor.watch,
    }
}

export function computedAccessor<A extends Array<ReactiveAccessor<any>>, R>(
    accessors: readonly [...A],
    computeValue: (...args: ReactiveValuesOf<A>) => R,
): ReactiveComputedAccessor<R> {
    const reactiveAccessor = createReactiveAccessor(
        computeValue(...accessors.map(it => it.read()) as ReactiveValuesOf<A>)
    )

    const cleanUpList = accessors.map(ref =>
        ref.watch(() => {
            const value = computeValue(...accessors.map(it => it.read()) as ReactiveValuesOf<A>)
            reactiveAccessor.write(value)
        })
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

export function computedRef<A extends Array<ReactiveRef<any>>, R>(
    refs: readonly [...A],
    computeValue: (...args: ReactiveValuesOf<A>) => R,
): ReactiveComputedRef<R> {
    const reactiveRef = createReactiveRef(
        computeValue(...refs.map(it => it.value) as ReactiveValuesOf<A>)
    )

    const cleanUpList = refs.map(ref =>
        ref.watch(() => {
            const value = computeValue(...refs.map(it => it.value) as ReactiveValuesOf<A>)
            reactiveRef.value = value
        })
    )

    function clean() {
        cleanUpList.forEach(clean => clean())
    }

    return {
        __observers__: reactiveRef.__observers__,
        get value() {
            return reactiveRef.value
        },
        set value(value) {
            reactiveRef.value = value
        },
        watch: reactiveRef.watch,
        clean,
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveAccessor<V> extends AccessorSync<V>, ReactiveObservable<V>, ReactiveInternals<V> {
}

export interface ReactiveRef<V> extends Ref<V>, ReactiveObservable<V>, ReactiveInternals<V> {
}

export interface ReactiveComputedAccessor<V> extends ReactiveAccessor<V> {
    clean(): void
}

export interface ReactiveComputedRef<V> extends ReactiveRef<V> {
    clean(): void
}

export interface ReactiveInternals<V> {
    __observers__: Set<ReactiveObserver<V>>
}

export interface ReactiveObservable<V> {
    watch(observer: ReactiveObserver<V>, options?: undefined | ReactiveWatchOptions): Task
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

export type ReactiveValueOf<R extends ReactiveAccessor<any> | ReactiveRef<any>> =
    R extends ReactiveAccessor<infer V> | ReactiveRef<infer V>
        ? V
        : never

export type ReactiveValuesOf<A extends Array<ReactiveAccessor<any> | ReactiveRef<any>>> =
    {[key in keyof A]: ReactiveValueOf<A[key]>}

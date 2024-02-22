import {call} from './fn.js'
import {createReactiveAccessor} from './reactive-accessor.js'
import type {ReactiveComputed, ReactiveInternals, ReactiveObservable, ReactiveOptions} from './reactive.js'
import type {Ref} from './ref.js'

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

export function createComputedRef<A extends Array<ReactiveRef<any>>, R>(
    refs: readonly [...A],
    computer: (...args: ReactiveRefValuesOf<A>) => R,
): ReactiveComputedRef<R> {
    function compute() {
        const computerArg = refs.map(it => it.value) as ReactiveRefValuesOf<A>
        const computedValue = computer(...computerArg)
        return computedValue
    }

    const reactiveRef = createReactiveRef(compute())

    const cleanUpList = refs.map(ref =>
        // We watch every accessor...
        ref.watch(() =>
            // ...and every time an accessor changes, we update the computed value.
            reactiveRef.value = compute()
        )
    )

    function clean() {
        cleanUpList.forEach(call)
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

export interface ReactiveRef<V> extends Ref<V>, ReactiveObservable<V>, ReactiveInternals<V> {
}

export interface ReactiveComputedRef<V> extends ReactiveRef<V>, ReactiveComputed {
}

export type ReactiveRefValueOf<R extends ReactiveRef<any>> =
    R extends ReactiveRef<infer V>
        ? V
        : never

export type ReactiveRefValuesOf<A extends Array<ReactiveRef<any>>> =
    {[key in keyof A]: ReactiveRefValueOf<A[key]>}

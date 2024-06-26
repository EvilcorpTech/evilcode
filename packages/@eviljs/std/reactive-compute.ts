import {call} from './fn-call.js'
import {
    createReactive,
    readReactive,
    watchReactive,
    writeReactive,
    type ReactiveOptions,
    type ReactiveProtocol,
    type ReactiveValuesOf,
} from './reactive.js'

export function createReactiveComputed<A extends Array<ReactiveProtocol<any>>, V>(
    reactives: readonly [...A],
    computer: (...args: ReactiveValuesOf<A>) => V,
    options?: undefined | ReactiveOptions<V>,
): ReactiveComputed<V> {
    function computeValue() {
        const computerArgs = reactives.map(readReactive) as ReactiveValuesOf<A>
        const computedValue = computer(...computerArgs)
        return computedValue
    }

    const reactiveComputed = createReactive(computeValue(), options)

    const cleanUpList = reactives.map(reactive =>
        // We watch every reactive...
        watchReactive(reactive, () => {
            // ...and every time an reactive changes, we update the computed value.
            writeReactive(reactiveComputed, computeValue())
        })
    )

    function read() {
        return readReactive(reactiveComputed)
    }

    function clean() {
        cleanUpList.forEach(call)
    }

    return {
        ...reactiveComputed,
        get value() {
            return read()
        },
        read,
        clean,
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveComputed<V> extends ReactiveProtocol<V> {
    get value(): V
    read(): V
    clean(): void
}

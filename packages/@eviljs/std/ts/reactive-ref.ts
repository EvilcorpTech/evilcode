import type {Task} from './fn-type.js'
import {
    createReactive,
    readReactive,
    watchReactive,
    writeReactive,
    type ReactiveObserver,
    type ReactiveOptions,
    type ReactiveProtocol,
    type ReactiveWatchOptions,
} from './reactive.js'
import type {Ref} from './ref.js'

export function createReactiveRef<V>(
    value: V,
    options?: undefined | ReactiveOptions<NoInfer<V>>,
): ReactiveRef<V> {
    const reactive = createReactive(value, options)

    function read(): V {
        return readReactive(reactive)
    }

    function write(newValue: V): V {
        return writeReactive(reactive, newValue)
    }

    function watch(observer: ReactiveObserver<V>, options?: undefined | ReactiveWatchOptions): Task {
        return watchReactive(reactive, observer, options)
    }

    return {
        ...reactive,
        get value() {
            return read()
        },
        set value(value) {
            write(value)
        },
        watch,
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveRef<V> extends Ref<V>, ReactiveProtocol<V> {
    watch(observer: ReactiveObserver<V>, options?: undefined | ReactiveWatchOptions): Task
}

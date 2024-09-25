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
import type {RwSync} from './rw.js'

export function createReactiveStore<V>(
    value: V,
    options?: undefined | ReactiveOptions<NoInfer<V>>,
): ReactiveStore<V> {
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

    return {...reactive, read, write, watch}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveStore<V> extends RwSync<V>, ReactiveProtocol<V> {
    watch(observer: ReactiveObserver<V>, options?: undefined | ReactiveWatchOptions): Task
}

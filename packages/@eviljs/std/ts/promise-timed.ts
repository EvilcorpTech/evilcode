import type {Fn} from './fn-type.js'
import {createPromise} from './promise.js'

export function createPromiseTimed<V = void>(args: PromiseTimedOptions): {
    promise: Promise<V>
    resolve: (value: V) => void
    reject: Fn<[reason?: any]>
} {
    const {timeout} = args

    let completed = false

    const {promise, resolve: resolvePromise, reject: rejectPromise} = createPromise<V>()

    const timeoutId = timeout
        ? setTimeout(onTimeout, timeout)
        : undefined

    function onTimeout() {
        if (completed) {
            return
        }

        rejectPromise()
    }

    function resolve(value: V) {
        clearTimeout(timeoutId)
        resolvePromise(value)
    }

    return {promise, resolve, reject: rejectPromise}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PromiseTimedOptions {
    timeout?: undefined | number
}

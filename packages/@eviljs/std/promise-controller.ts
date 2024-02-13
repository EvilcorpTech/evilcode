import {withPromiseResolvers} from './promise.js'

export function createPromiseController<V = void>(args: PromiseControllerOptions) {
    const {timeout} = args

    let completed = false

    const {promise, resolve: resolvePromise, reject: rejectPromise} = withPromiseResolvers<V>()

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

export interface PromiseControllerOptions {
    timeout?: undefined | number
}

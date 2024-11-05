import {createPromise} from './promise.js'

export function createPromiseTimed<V = void>(args: PromiseTimedOptions): {
    promise: Promise<V>
    resolve: (value: V) => void
    reject: (reason?: any) => void
} {
    const {timeout} = args

    const {promise, resolve, reject} = createPromise<V>()

    const timeoutId = timeout
        ? setTimeout(onTimeout, timeout)
        : undefined

    function onTimeout() {
        reject()
    }

    function onResolve(value: V) {
        clearTimeout(timeoutId)
        resolve(value)
    }

    function onReject(reason?: any) {
        clearTimeout(timeoutId)
        reject(reason)
    }

    return {promise, resolve: onResolve, reject: onReject}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PromiseTimedOptions {
    timeout?: undefined | number
}

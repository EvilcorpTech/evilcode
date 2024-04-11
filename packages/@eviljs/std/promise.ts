import {identity} from './fn-return.js'
import type {Fn} from './fn-type.js'
import {asResultError, type ResultOrError} from './result.js'

export function clonePromise<P>(value: P): Promise<Awaited<P>> {
    return Promise.resolve(value)
}

export function isSettledFulfilled<T>(promise: PromiseSettledResult<T>): promise is PromiseFulfilledResult<T> {
    return promise.status === 'fulfilled'
}

export function isSettledRejected<T>(promise: PromiseSettledResult<T>): promise is PromiseRejectedResult {
    return promise.status === 'rejected'
}

// A facade api for the new and not yed widely supported Promise.withResolvers().
export function createPromise<V = void>() {
    let resolve: Fn<[value: V | PromiseLike<V>]>
    let reject: Fn<[reason?: any]>

    const promise = new Promise<V>((localResolve, localReject) => {
        resolve = localResolve
        reject = localReject
    })

    return {promise, resolve: resolve!, reject: reject!}
}

export function resultFrom<V>(promise: Promise<V>): Promise<ResultOrError<V, unknown>> {
    return promise.then(identity, asResultError)
}

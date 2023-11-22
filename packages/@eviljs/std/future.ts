import type {CancelableProtocol} from './cancel.js'
import type {Task} from './fn.js'

export class Future {
    static from<P>(promise: P): Future<Awaited<P>> {
        return asFuture(promise)
    }

    static new<V>(
        executor: (
            resolve: (value: V | PromiseLike<V>) => void,
            reject: (error?: unknown) => void,
        ) => void,
    ): Future<Awaited<V>> {
        return createFuture(executor)
    }
}

export function createFuture<V>(
    executor: (
        resolve: (value: V | PromiseLike<V>) => void,
        reject: (error?: unknown) => void,
    ) => void,
): Future<Awaited<V>> {
    return asFuture(new Promise<V>(executor))
}

export function asFuture<V>(value: V | PromiseLike<V>): Future<Awaited<V>> {
    const state = {
        settled: false,
        fulfilled: false,
        rejected: false,
        canceled: false,
        result: undefined as undefined | Awaited<V>,
        error: undefined as undefined | unknown,
        onCancelObservers: [] as Array<Task>,
    }

    const promise = Promise.resolve(value).then(
        result => {
            state.settled = true
            state.fulfilled = true
            state.result = result
            return result
        },
        error => {
            state.settled = true
            state.rejected = true
            state.error = error
            throw error
        },
    )

    const self: Future<Awaited<V>> = {
        // Promise Protocol ////////////////////////////////////////////////////

        then(onFulfil, onReject) {
            return promise.then(onFulfil, onReject)
        },

        catch(onReject) {
            return promise.catch(onReject)
        },

        finally(onFinally) {
            return promise.finally(onFinally)
        },

        get [Symbol.toStringTag]() {
            return promise[Symbol.toStringTag]
        },

        // Future Protocol /////////////////////////////////////////////////////

        get settled() {
            return state.settled
        },

        get fulfilled() {
            return state.fulfilled
        },

        get rejected() {
            return state.rejected
        },

        get result() {
            return state.result
        },

        get error() {
            return state.error
        },

        // Cancelable Protocol /////////////////////////////////////////////////

        get canceled() {
            return state.canceled
        },

        cancel() {
            state.canceled = true

            state.onCancelObservers.forEach(it => it())
        },

        onCancel(onCancel) {
            state.onCancelObservers.push(onCancel)
            return self
        },
    }

    return self
}

// Type ////////////////////////////////////////////////////////////////////////

export interface Future<V = unknown> extends Promise<V>, CancelableProtocol {
    readonly settled: boolean
    readonly fulfilled: boolean
    readonly rejected: boolean
    readonly result: undefined | V
    readonly error: undefined | unknown
    onCancel(onCancel: Task): this
}

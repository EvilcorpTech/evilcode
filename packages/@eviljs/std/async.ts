import type {CancelableProtocol} from './cancel.js'
import type {Task} from './fn.js'

export function wait(delay: number) {
    const promise = new Promise((resolve) =>
        setTimeout(resolve, delay)
    )

    return promise
}

export function clonePromise<P>(value: P): Promise<Awaited<P>> {
    return Promise.resolve(value)
}

export function asFuture<V>(
    value: V,
    onCancel?: undefined | Task,
): Future<Awaited<V>> {
    const future = new Future<Awaited<V>>((resolve, reject) => {
        Promise.resolve(value).then(resolve, reject)
    })

    future.onCancel = onCancel

    return future
}

export class Future<V = unknown> extends Promise<V>
    implements CancelableProtocol
{
    static from<P>(promise: P, onCancel?: undefined | Task): Future<Awaited<P>> {
        return asFuture(promise, onCancel)
    }

    #canceled = false

    onCancel: undefined | Task

    get canceled() {
        return this.#canceled
    }

    cancel() {
        this.#canceled = true
        this.onCancel?.()
    }
}

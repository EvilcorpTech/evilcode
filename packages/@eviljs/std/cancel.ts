import type {Fn, FnArgs, Task} from './fn.js'

export function asCancelable<A extends FnArgs, R>(
    task: Fn<A, R>,
    onCancel?: undefined | Task,
): CancelableTuple<A, R> {
    const taskCancelable = createCancelable(task, onCancel)

    return [
        taskCancelable,
        taskCancelable.cancel,
        () => taskCancelable.canceled,
    ]
}

export function createCancelable<A extends FnArgs, R>(
    task: Fn<A, R>,
    onCancel?: undefined | Task,
): CancelableFn<A, R> {
    let canceled = false

    function run(...args: A): undefined | R {
        if (canceled) {
            return
        }

        return task(...args)
    }

    function cancel() {
        canceled = true

        onCancel?.()
    }

    function isCanceled() {
        return canceled
    }

    run.cancel = cancel

    Object.defineProperty(run, 'canceled' satisfies keyof CancelableFn, {
        get: isCanceled,
        writable: false,
    })

    return run as CancelableFn<A, R>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CancelableFn<A extends FnArgs = [], R = void> extends Fn<A, undefined | R>, CancelableProtocol {
}

export type CancelableTuple<A extends FnArgs, R> = [
    Fn<A, undefined | R>,
    Task,
    Task<boolean>,
]

export interface CancelableProtocol {
    readonly canceled: boolean
    cancel: Task
}

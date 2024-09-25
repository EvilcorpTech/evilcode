import type {Fn, FnArgs, Task} from './fn-type.js'

export function cancelable<A extends FnArgs, R>(
    task: Fn<A, R>,
    onCancel?: undefined | Task,
): FnCancelable<A, R> {
    function run(...args: A): undefined | R {
        if (run.canceled) {
            return
        }

        return task(...args)
    }

    function cancel() {
        run.canceled = true

        onCancel?.()
    }

    run.canceled = false
    run.cancel = cancel

    return run
}

export function createCancelable<A extends FnArgs, R>(
    task: Fn<A, R>,
    onCancel?: undefined | Task,
): CreateCancelableReturn<A, R> {
    const taskCancelable = cancelable(task, onCancel)

    return [
        taskCancelable,
        taskCancelable.cancel,
        () => taskCancelable.canceled,
    ]
}

// Types ///////////////////////////////////////////////////////////////////////

export interface FnCancelable<A extends FnArgs = [], R = void> extends Fn<A, undefined | R>, CancelableProtocol {
}

export type CreateCancelableReturn<A extends FnArgs, R> = [
    Fn<A, undefined | R>,
    Task,
    Task<boolean>,
]

export interface CancelableProtocol {
    readonly canceled: boolean
    cancel(): void
}

import type {Fn, FnArgs} from '@eviljs/std/fn.js'

export const SuspenseMap = new WeakMap<SuspenseMapKey, SuspenseMapValue>()

/**
* @throws Promise | Error
*/
export function useSuspense<A extends FnArgs, R>(asyncTask: Fn<A, Promise<R>>, ...args: A): R {
    const suspense = (() => {
        const state = SuspenseMap.get(asyncTask)

        const stateIsValid = true
            && state
            && args.length === state.args.length
            && args.every((arg, idx) => arg === state.args[idx])

        if (stateIsValid) {
            return state.suspense
        }

        const suspense = createSuspenseState(asyncTask, ...args)
        SuspenseMap.set(asyncTask, {args, suspense})
        return suspense

    })()

    switch (suspense.stage) {
        case 'pending': throw suspense.promise
        case 'fulfilled': return suspense.result as R
        case 'rejected': throw suspense.error
    }
}

export function createSuspenseState<A extends FnArgs, R>(asyncTask: Fn<A, Promise<R>>, ...args: A): SuspenseState<R> {
    const self: SuspenseState<R> = {
        stage: 'pending',
        result: undefined,
        error: undefined,
        promise: asyncTask(...args).then(
            result => {
                Object.assign(self, {
                    stage: 'fulfilled',
                    result,
                    error: undefined,
                    promise: self.promise,
                } satisfies SuspenseState<R>)

                return result
            },
            error => {
                Object.assign(self, {
                    stage: 'rejected',
                    result: undefined,
                    error,
                    promise: self.promise,
                } satisfies SuspenseState<R>)

                throw error
            },
        ),
    }

    return self
}

// Types ///////////////////////////////////////////////////////////////////////

type SuspenseState<R> =
    | {
        stage: 'pending'
        result: undefined
        error: undefined
        promise: Promise<R>
    }
    | {
        stage: 'fulfilled'
        result: R
        error: undefined
        promise: Promise<R>
    }
    | {
        stage: 'rejected'
        result: undefined
        error: unknown
        promise: Promise<R>
    }

type SuspenseMapKey = Function
type SuspenseMapValue = {args: FnArgs, suspense: SuspenseState<unknown>}

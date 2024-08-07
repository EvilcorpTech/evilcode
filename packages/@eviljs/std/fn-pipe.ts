import type {Io} from './fn-type.js'
import {identity} from './fn-return.js'

export function chain<I>(input: I, ...args: Array<Io<I, void>>): I {
    for (const arg of args) {
        arg(input)
    }

    return input
}

export function piping(): PipeContinuation<undefined>
export function piping<I>(input: I): PipeContinuation<I>
export function piping<I>(input?: I): PipeContinuation<undefined | I> {
    function continuation(): undefined | I
    function continuation<O>(fn: Io<undefined | I, O>): PipeContinuation<O>
    function continuation<O>(fn?: Io<undefined | I, O>): undefined | I | PipeContinuation<O> {
        if (! fn) {
            return input
        }
        return piping(fn(input))
    }

    return continuation
}

export function piped(): PipeLazy<undefined>
export function piped<V1>(input: V1): PipeLazy<V1>
export function piped<V1>(input?: V1): PipeLazy<undefined | V1> {
    const stack: Array<PipeLazyTask> = [identity]

    function compute(stack: Array<PipeLazyTask>): unknown {
        return computePipeLazy(stack, input)
    }

    return createPipeLazy(stack, compute) as PipeLazy<V1>
}

export function createPipeLazy(
    stack: Array<PipeLazyTask>,
    compute: Io<Array<PipeLazyTask>, unknown>,
): PipeLazy<any> {
    const self: PipeLazy<any> = {
        get __stack__() {
            return stack
        },
        to(fn) {
            return createPipeLazy([...stack, fn], compute)
        },
        end() {
            return compute(stack)
        },
    }

    return self
}

export function computePipeLazy(stack: Array<PipeLazyTask>, input: unknown): unknown {
    const [task, ...otherStack] = stack

    if (! task) {
        return input
    }

    return computePipeLazy(otherStack, task(input))
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PipeContinuation<I> {
    (): I
    <O>(fn: Io<I, O>): PipeContinuation<O>
}

export interface PipeLazy<V1> {
    __stack__: Array<PipeLazyTask>
    to<V2>(fn: Io<V1, V2>): PipeLazy<V2>
    end(): V1
}

export type PipeLazyTask = Io<unknown, unknown>

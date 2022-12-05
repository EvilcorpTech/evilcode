import {identity} from './fn.js'
import type {Io} from './monad.js'

export * from './monad.js'
export * from './result.js'

export function pipe<V1>(input: V1) {
    const stack: Array<PipeTask> = [identity]

    function compute(stack: Array<PipeTask>): unknown {
        return computePipe(stack, input)
    }

    return createPipe(stack, compute) as Pipe<V1>
}

export function createPipe(
    stack: Array<PipeTask>,
    compute: Io<Array<PipeTask>, unknown>,
) {
    const self = {
        get __stack__() {
            return stack
        },
        to(fn: Io<unknown, unknown>) {
            return createPipe([...stack, fn], compute)
        },
        end() {
            return compute(stack)
        },
    }

    return self
}

export function computePipe(stack: Array<PipeTask>, input: unknown): unknown {
    const [task, ...otherStack] = stack

    if (! task) {
        return input
    }

    return computePipe(otherStack, task(input))
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Pipe<V1> {
    __stack__: Array<PipeTask>
    to<V2>(fn: Io<V1, V2>): Pipe<V2>
    end(): V1
}

export type PipeTask = Io<unknown, unknown>

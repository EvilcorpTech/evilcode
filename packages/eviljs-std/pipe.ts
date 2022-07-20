import {identity} from './fn.js'
import type {Io} from './monad.js'

export {Error, isError} from './error.js'
export type {Result} from './error.js'
export * from './monad.js'

/*
* EXAMPLE
*/
/*
import {ensureStringNotEmpty} from './assert.js'
import {Error} from './error.js'
import {
    mappingCatch,
    mappingCatchError,
    mappingEither,
    mappingError,
    mappingNone,
    mappingPromise,
    mappingResult,
    mappingSome,
    mappingThen,
    mappingTrying,
    then,
} from './monad.js'

const someResult = pipe(undefined as undefined | null | string)
    .to(mappingNone(it => 'Mario'))
    .to(mappingSome(it => ({name: `Super ${it}`, age: 21})))
.end()

const eitherResult = pipe(someResult)
    .to(it => it.age > 18 ? it : Error('TooYoung' as const))
    .to(mappingResult(identity))
    .to(mappingError(identity))
    .to(mappingEither(identity, identity))
    .to(mappingTrying(
        mappingResult(it => (ensureStringNotEmpty(it), it)),
        error => Error('BadString' as const),
    ))
    .to(mappingError(it => {
        switch (it.error) {
            case 'BadString':
            case 'TooYoung': {
                return 'John Snow'
            }
        }
    }))
    .to(it => `Hello, ${it}!`)
.end()

const asyncResult = pipe(Promise.resolve(eitherResult))
    .to(then(identity, Error))
    .to(mappingThen(identity))
    .to(mappingCatch(Error))
    .to(mappingCatch(error => Error('BadRequest' as const)))
    .to(mappingPromise(identity, Error))
    .to(mappingCatchError()) // Same of mappingCatch(Error).
    .to(mappingCatchError('BadRequest' as const))
    .to(then(mappingResult(identity)))
    .to(then(mappingError(it => 'Hello World!')))
.end()
*/
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

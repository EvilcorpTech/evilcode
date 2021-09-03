import {Error, isError} from './error.js'
import {tryCatch} from './try.js'

export {Error, isError} from './error.js'
export type {Result} from './error.js'
export {tryCatch} from './try.js'

// EXAMPLE
// import {ensureStringNotEmpty} from './assert.js'
// import {theFalse, theNull} from './return.js'
// const result = pipe({name: 'Super Mario', age: 21})
// .to(it => it.age > 18 ? it : Error('TooYoung' as const))
// .to(it => mapValueWith(it, it => it))
// .to(it => mapErrorWith(it, it => it))
// .to(it => mapResultWith(it, it => it, it => it))
// .to(mapValue(it => it))
// .to(mapError(it => it))
// .to(mapResult(it => it, it => it))
// .to(it => tryCatch(
//     () => mapValueWith(it, it => it.name.toUpperCase()),
//     error => Error('NotString' as const)
// ))
// .to(tryOr(
//     mapValue(it => (ensureStringNotEmpty(it), it)),
//     error => Error('EmptyString' as const),
// ))
// .to(it => {
//     if (! isError(it)) return it
//     switch (it.error) {
//         case 'EmptyString':
//         case 'NotString':
//         case 'TooYoung': {
//             return 'John Snow'
//         }
//     }
// })
// .to(it => `Hello, ${it}!`)
// .end()
// const result2 = pipe(result)
// .to(it => Promise.resolve(it))
// .to(then(it => it))
// .to(then(
//     it => it,
//     error => Error('BadRequest' as const)
// ))
// .to(thenOr(
//     it => it,
//     error => Error('BadRequest' as const)
// ))
// .to(thenCatch(error => Error('BadRequest' as const)))
// .to(then(mapValue(it => it)))
// .to(then(mapError(it => 'Hello World!')))
// .end()
export function pipe<V1>(input: V1) {
    const task: PipeTask = {type: 'MapValue', mapValue: () => input}

    function compute(stack: Array<PipeTask>): unknown {
        return computePipe(stack, {value: void undefined})
    }

    return createPipe([task], compute) as Pipe<V1>
}

export function createPipe(
    stack: Array<PipeTask>,
    compute: Fn<Array<PipeTask>, unknown>,
) {
    const self = {
        __stack__: stack,
        to(fn: Fn<unknown, unknown>) {
            const task: PipeTask = {type: 'MapValue', mapValue: fn}
            return createPipe([...stack, task], compute)
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

    switch (task.type) {
        case 'MapValue': {
            return computePipe(otherStack, task.mapValue(input))
        }
    }
}

export function mapResultWith<V1, V2, V3>(
    input: V1,
    onValue: Fn<Exclude<V1, Error<unknown>>, V2>,
    onError: Fn<Extract<V1, Error<unknown>>, V3>,
): V2 | V3
{
    return ! isError(input)
        ? mapValueWith(input as Exclude<V1, Error<unknown>>, onValue) as V2
        : mapErrorWith(input as Extract<V1, Error<unknown>>, onError) as V3
}

export function mapValueWith<V1, V2>(
    input: V1,
    fn: Fn<Exclude<V1, Error<unknown>>, V2>,
): Extract<V1, Error<unknown>> | V2
{
    return ! isError(input)
        ? fn(input as Exclude<V1, Error<unknown>>)
        : input as Extract<V1, Error<unknown>>
}

function mapErrorWith<V1, V2>(
    input: V1,
    fn: Fn<Extract<V1, Error<unknown>>, V2>,
): Exclude<V1, Error<unknown>> | V2
{
    return isError(input)
        ? fn(input as Extract<V1, Error<unknown>>)
        : input as Exclude<V1, Error<unknown>>
}

export function mapResult<V1, V2, V3>(
    onValue: Fn<Exclude<V1, Error<unknown>>, V2>,
    onError: Fn<Extract<V1, Error<unknown>>, V3>
): Fn<V1, V2 | V3>
{
    return (input: V1) => mapResultWith(input, onValue, onError)
}

export function mapValue<V1, V2>(
    fn: Fn<Exclude<V1, Error<unknown>>, V2>
): Fn<V1, Extract<V1, Error<unknown>> | V2>
{
    return (input: V1) => mapValueWith(input, fn)
}

export function mapError<V1, V2>(
    fn: Fn<Extract<V1, Error<unknown>>, V2>
): Fn<V1, Exclude<V1, Error<unknown>> | V2>
{
    return (input: V1) => mapErrorWith(input, fn)
}

export function tryOr
    <V1, V2, V3>
    (fn: Fn<V1, V2>, onError: Fn<unknown, V3>): Fn<V1, V2 | V3>
{
    return (input: V1) => tryCatch(() => fn(input), onError)
}

export function then<V1, V2>(fn: Fn<V1, V2>, onError?: never): Fn<Promise<V1>, Promise<V2>>
export function then<V1, V2, V3>(fn: Fn<V1, V2>, onError: Fn<unknown, V3>): Fn<Promise<V1>, Promise<V2 | V3>>
export function then
    <V1, V2, V3>
    (fn: Fn<V1, V2>, onError?: Fn<unknown, V3>): Fn<Promise<V1>, Promise<V2 | V3>>
{
    return ! onError
        ? (input: Promise<V1>) => input.then(fn)
        : (input: Promise<V1>) => input.then(fn).catch(onError)
}

export function thenOr
    <V1, V2, V3>
    (fn: Fn<V1, V2>, onError?: Fn<unknown, V3>): Fn<Promise<V1>, Promise<V2 | V3>>
{
    return (input: Promise<V1>) => input.then(fn).catch(onError)
}

export function thenCatch
    <V1, V2>
    (fn: Fn<unknown, V2>): Fn<Promise<V1>, Promise<V1 | V2>>
{
    return (input: Promise<V1>) => input.catch(fn)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Pipe<V1> {
    __stack__: Array<PipeTask>
    to<V2>(fn: Fn<V1, V2>): Pipe<V2>
    end(): V1
}

export type PipeTask<R = unknown> =
    | {type: 'MapValue', mapValue: Fn<unknown, R>}

export interface Fn<I, O> {
    (input: I): O
}

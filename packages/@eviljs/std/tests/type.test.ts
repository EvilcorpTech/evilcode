import {asArray} from '@eviljs/std/type-as'
import {expectType} from '@eviljs/std/type-expect'
import {describe, test} from 'node:test'

describe('@eviljs/std/type-as', (ctx) => {
    test('asArray()', (ctx) => {
        expectType<[number]>(asArray([] as any as (number | [number])))
        expectType<number[]>(asArray([] as any as (number | number[])))
        expectType<Array<number>>(asArray([] as any as (number | Array<number>)))
        expectType<readonly [number]>(asArray([] as any as (number | readonly [number])))
        expectType<readonly number[]>(asArray([] as any as (number | readonly number[])))
        expectType<readonly number[]>(asArray([] as any as (number | ReadonlyArray<number>)))
        expectType<[number, ...Array<unknown>]>(asArray([] as any as (number | [number, string])))
        expectType<Array<number|string>>(asArray([] as any as (number | [number, string])))
    })
})

// export function asArray<V, I>(value: V | I):
//     V extends Array<infer I> ? // [T] | T[] | Array<T>
//         number extends V['length'] ?
//             'T[] | Array<T>' | I// T[] | Array<T>
//         : '[T]' // [T]
//     : V extends readonly (infer I)[] ? // readonly T[] | readonly [T] | ReadonlyArray<T>
//         number extends V['length'] ?
//             'readonly T[] | ReadonlyArray<T>' // readonly T[] | ReadonlyArray<T>
//         : 'readonly [T]' // readonly [T]
//     : 'T' // T
// export function asArray<V, T extends unknown[]>(value: V | [...T]): [V] | [...T]
// export function asArray<V, T extends unknown[]>(value: V | readonly [...T]): [V] | readonly [...T]
// export function asArray<V, I>(value: V | readonly I[]): [V] | readonly I[]
// export function asArray<V, I>(value: V | I[]): V[] | I[]

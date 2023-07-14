import {asArray} from '../packages/@eviljs/std/type.js'

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

const a1 = asArray([] as any as (number | [number]))
const b1: [number] = a1

const a2 = asArray([] as any as (number | number[]))
const b2: number[] = a2

const a3 = asArray([] as any as (number | Array<number>))
const b3: Array<number> = a3

const a4 = asArray([] as any as (number | readonly [number]))
const b4: readonly [number] = a4

const a5 = asArray([] as any as (number | readonly number[]))
const b5: readonly number[] = a5

const a6 = asArray([] as any as (number | ReadonlyArray<number>))
const b6: readonly number[] = a6

const a7 = asArray([] as any as (number | [number, string]))
const b71: [number, ...Array<unknown>] = a7
const b72: Array<number|string> = a7
// const b73: [number] = a7

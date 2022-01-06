import {assertObject} from './assert.js'
import {isArray, isObject, isUndefined} from './type.js'

export const ObjectPathArrayOpenRegexp = /\[/g
export const ObjectPathArrayCloseRegexp = /\]/g
export const ObjectPathCache: Record<string, Array<string | number>> = {}

export function map
    <
        K extends string | number,
        V,
        RK extends string | number,
    >
    (
        object: Record<K, V>,
        withFn: {key: MapObjectKeyFn<K, V, RK>, value?: never},
    )
    : Record<RK, V>
export function map
    <
        K extends string | number,
        V,
        RV,
    >
    (
        object: Record<K, V>,
        withFn: {key?: never, value: MapObjectValueFn<V, K, RV>},
    )
    : Record<K, RV>
export function map
    <
        K extends string | number,
        V,
        RK extends string | number,
        RV,
    >
    (
        object: Record<K, V>,
        withFn: {key: MapObjectKeyFn<K, V, RK>, value: MapObjectValueFn<V, K, RV>},
    )
    : Record<RK, RV>
export function map
    <
        K extends string | number,
        V,
        RK extends string | number,
        RV,
    >
    (
        object: Record<K, V>,
        withFn: {key?: MapObjectKeyFn<K, V, RK>, value?: MapObjectValueFn<V, K, RV>},
    )
{
    function mapper(it: [K, V]) {
        const [key, value] = it
        const tuple: [K | RK, V | RV] = [
            withFn.key?.(key, value) ?? key,
            withFn.value?.(value, key) ?? value,
        ]

        return tuple
    }

    return Object.fromEntries(
        Object.entries(object).map(mapper as any)
    )
}

export function withoutProps<O, P extends keyof O>(object: O, ...props: Array<P>) {
    assertObject(object, 'object')

    const obj = {...object}

    for (const prop of props) {
        delete obj[prop]
    }

    return obj as Omit<O, P>
}

export function withoutUndefinedProps<O>(object: O) {
    assertObject(object, 'object')

    const obj = {...object}

    for (const prop in obj) {
        if (isUndefined(obj[prop])) {
            delete obj[prop]
        }
    }

    return obj
}

export function get(obj: GetObject, path: GetPath) {
    const parts = isArray(path)
        ? path
        : fromPathToParts(path)

    let node = obj as unknown

    for (const part of parts) {
        if (! isObject(node) && ! isArray(node)) {
            return
        }
        node = node[part as any]
    }

    return node
}

export function fromPathToParts(path: string) {
    if (! ObjectPathCache[path]) {
        ObjectPathCache[path] = path
            .replace(ObjectPathArrayOpenRegexp, '.#')
            .replace(ObjectPathArrayCloseRegexp, '')
            .split('.')
            .map(it =>
                it.startsWith('#')
                    ? Number(it.slice(1))
                    : it
            )
    }
    return ObjectPathCache[path]!
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MapObjectKeyFn<K, V, R> {
    (key: K, value: V): R
}
export interface MapObjectValueFn<V, K, R> {
    (value: V, key: K): R
}

export type GetObject = Record<PropertyKey, unknown> | Array<unknown>
export type GetPath = string | Array<string | number>

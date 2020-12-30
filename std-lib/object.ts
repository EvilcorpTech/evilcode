import {assertObject} from './assert.js'
import {isArray, isObject, isUndefined} from './type.js'

export const GetArrayOpenRegexp = /\[/g
export const GetArrayCloseRegexp = /\]/g
export const GetPathCache: Record<string, Array<string | number>> = {}

export function mapObject<V, R>(object: Record<string, V>, withFn: {key?: MapObjectKeyFn<V>, value?: never}): Record<string, V>
export function mapObject<V, R>(object: Record<string, V>, withFn: {key?: MapObjectKeyFn<V>, value: MapObjectValueFn<V, R>}): Record<string, R>
export function mapObject<V, R>(object: Record<string, V>, withFn: {key?: MapObjectKeyFn<V>, value?: MapObjectValueFn<V, R>}) {
    function mapper(it: [string, V]) {
        const [key, value] = it
        const tuple: [string, V | R] = [
            withFn.key?.(key, value) ?? key,
            withFn.value?.(value, key) ?? value,
        ]

        return tuple
    }

    return Object.fromEntries(
        Object.entries(object).map(mapper as any)
    )
}

export function objectWithout<O, P extends keyof O>(object: O, ...props: Array<P>) {
    assertObject(object, 'object')

    const obj = {...object}

    for (const prop of props) {
        delete obj[prop]
    }

    return obj as Omit<O, P>
}

export function objectWithoutUndefined<O>(object: O) {
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
    if (! GetPathCache[path]) {
        GetPathCache[path] = path
            .replace(GetArrayOpenRegexp, '.#')
            .replace(GetArrayCloseRegexp, '')
            .split('.')
            .map(it =>
                it[0] === '#'
                    ? Number(it.slice(1))
                    : it
            )
    }
    return GetPathCache[path]!
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MapObjectKeyFn<V> {
    (key: string, value: V): string
}
export interface MapObjectValueFn<V, R> {
    (value: V, key: string): R
}

export type GetObject = Record<PropertyKey, unknown> | Array<unknown>
export type GetPath = string | Array<string | number>

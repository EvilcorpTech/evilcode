import type {Fn, Io} from './fn.js'
import {isArray, isDefined, isObject, isUndefined} from './type.js'

export const ObjectPathArrayOpenRegexp = /\[/g
export const ObjectPathArrayCloseRegexp = /\]/g
export const ObjectPathCache: Record<string, Array<string | number>> = {}

export function isObjectEmpty(object: object): boolean {
    for (const it in object) {
        return false
    }
    return true
}

export function areObjectsEqualShallow<T extends object>(firstObject: T, secondObject: T): boolean {
    if (firstObject === secondObject) {
        return true
    }

    const firstKeys = Object.keys(firstObject)
    const secondKeys = Object.keys(secondObject)
    const allKeys = new Set([...firstKeys, ...secondKeys])

    // Shallow equality check.
    for (const key of allKeys) {
        // A not defined property and a property with undefined value are considered equal.
        const firstValue = firstObject[key as keyof typeof firstObject]
        const secondValue = secondObject[key as keyof typeof secondObject]

        if (firstValue !== secondValue) {
            // Something changed inside the object.
            return false
        }
    }

    // Nothing changed inside the object.
    return true
}

export function areObjectsEqualShallowStrict<T extends object>(firstObject: T, secondObject: T): boolean {
    if (firstObject === secondObject) {
        return true
    }

    const firstKeys = Object.keys(firstObject)
    const secondKeys = Object.keys(secondObject)

    if (firstKeys.length !== secondKeys.length) {
        return false
    }

    const allKeys = new Set([...firstKeys, ...secondKeys])

    // Shallow equality check.
    for (const key of allKeys) {
        const keyInFirst = key in firstObject
        const keyInSecond = key in secondObject

        if (keyInFirst !== keyInSecond) {
            return false
        }

        const aValue = firstObject[key as keyof typeof firstObject]
        const bValue = secondObject[key as keyof typeof secondObject]

        if (aValue !== bValue) {
            // Something changed inside the object.
            return false
        }
    }

    // Nothing changed inside the object.
    return true
}

export function cloneObjectShallow<O extends object>(object: O): O {
    return Object.create(
        Object.getPrototypeOf(object),
        Object.getOwnPropertyDescriptors(object),
    )
}

export function mapObject<K extends PropertyKey, V, RK extends PropertyKey>(
    object: Record<K, V>,
    fn: {key: ObjectKeyMapper<K, V, RK>, value?: never},
): Record<RK, V>
export function mapObject<K extends PropertyKey, V, RV>(
    object: Record<K, V>,
    fn: {key?: never, value: ObjectValueMapper<V, K, RV>},
): Record<K, RV>
export function mapObject<K extends PropertyKey, V, RK extends PropertyKey, RV>(
    object: Record<K, V>,
    withFn: {key: ObjectKeyMapper<K, V, RK>, value: ObjectValueMapper<V, K, RV>},
): Record<RK, RV>
export function mapObject<K extends PropertyKey, V, RK extends PropertyKey, RV>(
    object: Record<K, V>,
    fn: {key?: ObjectKeyMapper<K, V, RK>, value?: ObjectValueMapper<V, K, RV>},
): Record<K | RK, V | RV> {
    function mapKeyValue(it: [K, V]): [K | RK, V | RV] {
        const [key, value] = it
        return [
            fn.key
                ? fn.key(key, value)
                : key
            ,
            fn.value
                ? fn.value(value, key)
                : value
            ,
        ]
    }

    const entries = Object.entries(object) as Array<[K, V]>
    return Object.fromEntries(entries.map(mapKeyValue)) as Record<K | RK, V | RV>
}

export function mapObjectKey<K extends PropertyKey, V, RK extends PropertyKey>(
    object: Record<K, V>,
    fn: ObjectKeyMapper<K, V, RK>,
): Record<RK, V> {
    function mapKey(it: [K, V]): [RK, V] {
        const [key, value] = it
        return [fn(key, value), value]
    }

    const entries = Object.entries(object) as Array<[K, V]>
    return Object.fromEntries(entries.map(mapKey)) as Record<RK, V>
}

export function mapObjectValue<K extends PropertyKey, V, RV>(
    object: Record<K, V>,
    fn: ObjectValueMapper<V, K, RV>,
): Record<K, RV> {
    function mapValue(it: [K, V]): [K, RV] {
        const [key, value] = it
        return [key, fn(value, key)]
    }

    const entries = Object.entries(object) as Array<[K, V]>
    return Object.fromEntries(entries.map(mapValue)) as Record<K, RV>
}

export function omitObjectProps<O extends object, P extends keyof O>(object: O, ...props: Array<P>) {
    const objectOmitted = {...object}

    for (const prop of props) {
        delete objectOmitted[prop]
    }

    return objectOmitted as Omit<O, P>
}

export function omitObjectPropsUndefined<O extends object>(object: O) {
    const objectOmitted = {...object}

    for (const prop in objectOmitted) {
        if (isUndefined(objectOmitted[prop])) {
            delete objectOmitted[prop]
        }
    }

    return objectOmitted
}

export function objectFromEntry<K extends PropertyKey, V>(
    key: K,
    value: undefined | V,
): object | {[key in K]: V}
{
    return isDefined(value)
        ? {[key]: value}
        : {}
}

export function getObjectPath(root: ObjectRoot, path: ObjectPath) {
    const parts = isArray(path)
        ? path
        : fromObjectPathToParts(path)

    let node = root as unknown

    for (const part of parts) {
        if (! isObject(node) && ! isArray(node)) {
            return
        }
        node = node[part as any]
    }

    return node
}

export function fromObjectPathToParts(path: string) {
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

/*
* Stores an item inside an object, returning the object. Useful when used inside
* an Array.reduce() function.
*
* EXAMPLE
* const index = indexBy({}, {key: 123}, it => it.key)
* [{id: 123}, {id: 234}].reduce((index, it) => indexBy(index, it, it => it.id), {})
*/
export function indexBy<
    M extends Record<PropertyKey, unknown>,
    K extends keyof M,
    T extends M[K],
>(
    map: M,
    item: T,
    keyOf: Io<T, K>,
): M {
    const key = keyOf(item)

    map[key] = item

    return map
}

export function indexingBy<
    M extends Record<PropertyKey, unknown>,
    K extends keyof M,
    T extends M[K],
>(
    keyOf: Io<T, K>,
): Fn<[map: M, item: T], M> {
    function indexItem(map: M, item: T) {
        return indexBy(map, item, keyOf)
    }

    return indexItem
}

// Types ///////////////////////////////////////////////////////////////////////

export type ObjectKeyMapper<K, V, R> = (key: K, value: V) => R
export type ObjectValueMapper<V, K, R> = (value: V, key: K) => R

export type ObjectRoot = Record<PropertyKey, unknown> | Array<unknown>
export type ObjectPath = string | Array<string | number>

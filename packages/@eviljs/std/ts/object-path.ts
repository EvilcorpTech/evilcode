import {lastOf} from './array.js'
import {isArray, isObject} from './type-is.js'

export const ObjectPathArrayOpenRegexp: RegExp = /\[/g
export const ObjectPathArrayCloseRegexp: RegExp = /\]/g
export const ObjectPathCache: Record<string, Array<string | number>> = {}

export function getObjectPath(root: ObjectRoot, path: ObjectPath): unknown {
    let node = root as unknown

    for (const part of path) {
        if (! isObject(node) && ! isArray(node)) {
            return
        }
        node = node[part as any]
    }

    return node
}

export function setObjectPath(root: ObjectRoot, path: ObjectPath, newValue: unknown): unknown {
    let node = root as ObjectRoot

    for (const part of path.slice(0, -1)) {
        node = node[part as any] as ObjectRoot
    }

    const lastPart = lastOf(path)

    const oldValue = node[lastPart as any]
    node[lastPart as any] = newValue

    return oldValue
}

/** @deprecated */
export function fromObjectPathToParts(path: string): Array<number | string> {
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

export type ObjectRoot = Record<PropertyKey, unknown> | Array<unknown>
export type ObjectPath = Array<string | number>

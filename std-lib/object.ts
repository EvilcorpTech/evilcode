import {isArray, isObject} from './type.js'

export const GetArrayOpenRegexp = /\[/g
export const GetArrayCloseRegexp = /\]/g
export const GetPathCache: Record<string, Array<string | number>> = {}

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

export type GetObject = Record<PropertyKey, unknown> | Array<unknown>
export type GetPath = string | Array<string | number>

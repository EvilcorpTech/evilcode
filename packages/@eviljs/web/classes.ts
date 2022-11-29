import type {Nil} from '@eviljs/std/type.js'
import {isArray, isObject, isString} from '@eviljs/std/type.js'

export function classes(...names: Array<Classes>) {
    const list: Array<string> = []

    for (const item of names) {
        if (! item) {
            continue
        }

        if (isString(item)) {
            list.push(item)
            continue
        }

        if (isArray(item)) {
            list.push(classes(...item))
            continue
        }

        if (isObject(item)) {
            for (const name in item) {
                if (item[name]) {
                    list.push(name)
                }
            }
            continue
        }

        console.error(
            '@eviljs/web/classes.classes(~~names~~):\n'
            + `names must be a String | Object | Array, given "${item}".`
        )
    }

    return list.join(' ')
}

// Types ///////////////////////////////////////////////////////////////////////

export type Classes =
    | Nil
    | string
    | Record<string, boolean | null | undefined>
    | Array<Classes>
    | readonly Classes[]
    // | readonly [...Array<Classes>]

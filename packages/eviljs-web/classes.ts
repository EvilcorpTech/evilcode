import {throwInvalidArgument} from '@eviljs/std/throw.js'
import {isArray, isString, isObject} from '@eviljs/std/type.js'

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

        return throwInvalidArgument(
            '@eviljs/web/class.classes(~~names~~):\n'
            + `names must be a String | Object | Array, given "${item}".`
        )
    }

    return list.join(' ')
}

// Types ///////////////////////////////////////////////////////////////////////

export type Classes =
    | undefined
    | null
    | string
    | Record<string, boolean | null | undefined>
    | Array<Classes>
    | readonly Classes[]
    // | readonly [...Array<Classes>]

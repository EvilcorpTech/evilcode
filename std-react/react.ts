import { isArray, isString, isObject } from '@eviljs/std-lib/type'
import { throwInvalidArgument } from '@eviljs/std-lib/error'

export function classes(...names: Array<ClassName>) {
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
            '@eviljs/std-react/react.classes(~~names~~):\n'
            + `names must be a String | Object | Array, given "${item}".`
        )
    }

    return list.join(' ')
}

export function className(...names: Array<ClassName>) {
    return {className: classes(...names)}
}

// Types ///////////////////////////////////////////////////////////////////////

export type ClassName =
    | undefined
    | null
    | string
    | Record<string, boolean | null | undefined>
    | Array<ClassName>

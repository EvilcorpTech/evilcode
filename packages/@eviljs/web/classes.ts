import {isObject} from '@eviljs/std/type-is.js'
import type {None} from '@eviljs/std/type.js'

export function classes(...args: Array<Classes>): string {
    // Implementation based on these benchmarks:
    // https://jsperf.app/xiboxo/5
    // https://jsperf.app/zuleqe/1
    // Tested in 2023 on Chrome 114, Firefox 114, Safari 16.

    let classString = ''

    for (const arg of args) {
        if (! arg) {
            continue
        }

        const separator = classString ? ' ' : ''

        // From most to least probable.

        if (typeof arg === 'string') {
            classString += separator + arg
            continue
        }

        if (Array.isArray(arg)) {
            classString += separator + classes(...arg)
            continue
        }

        if (isObject(arg)) {
            for (const key in arg) {
                if (arg[key]) {
                    classString += separator + key
                }
            }
            continue
        }

        console.error(
            '@eviljs/web/classes.classes(~~...args~~):\n'
            + `args must be of type String | Object | Array, given "${arg}".`
        )
    }

    return classString
}

// Types ///////////////////////////////////////////////////////////////////////

export type Classes =
    | None
    | string
    | Record<string, None | boolean>
    | Array<Classes>
    | readonly Classes[]
    // | readonly [...Array<Classes>]

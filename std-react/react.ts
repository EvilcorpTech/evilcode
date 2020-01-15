export function classes(...names: Array<ClassName>) {
    const list: Array<string> = []

    for (const item of names) {
        if (! item) {
            continue
        }

        if (typeof item === 'string') {
            list.push(item)
            continue
        }

        if (Array.isArray(item)) {
            list.push(classes(...item))
            continue
        }

        if (item.constructor === Object) {
            for (const name in item) {
                if (item[name]) {
                    list.push(name)
                }
            }
            continue
        }

        throw new Error('Unrecognized type')
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
    | Record<string, boolean>
    | Array<ClassName>
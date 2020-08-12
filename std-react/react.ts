import {isArray, isString, isObject} from '@eviljs/std-lib/type'
import {throwInvalidArgument} from '@eviljs/std-lib/error'
import {useLayoutEffect, useRef} from 'react'

export {times} from '@eviljs/std-lib/fn'

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

export function useMountedRef() {
    const mountedRef = useRef(true)

    // We use useLayoutEffect() instead of useEffect() because in React 17
    // useEffect() became asynchronous (it was synchronous); which means that
    // the useEffect() destructor is called by the React 17 scheduler in a next
    // future (with low priority), but not right after the component has been
    // unmounted. useLayoutEffect() destructor instead remains synchronous, and
    // that's what we need to reflect as soon as possible the state
    // (mounted/unmounted) inside the reference.
    useLayoutEffect(() => {
        function unmount() {
            mountedRef.current = false
        }

        return unmount
    }, [])

    return mountedRef
}

// Types ///////////////////////////////////////////////////////////////////////

export type ClassName =
    | undefined
    | null
    | string
    | Record<string, boolean | null | undefined>
    | Array<ClassName>

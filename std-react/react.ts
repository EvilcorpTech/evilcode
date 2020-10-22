import {isArray, isString, isObject} from '@eviljs/std-lib/type.js'
import {throwInvalidArgument} from '@eviljs/std-lib/error.js'
import React from 'react'
const {useEffect, useLayoutEffect, useRef} = React

export {times} from '@eviljs/std-lib/fn.js'

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

/*
* Used to access the previous value of a prop.
*
* EXAMPLE
* function MyComponent(props) {
*     const {selected} = props
*     const prevSelected = usePrevious(props.selected)
* }
*/
export function usePrevious<T>(value: T) {
    const ref = useRef<T>()

    useEffect(() => {
        ref.current = value
    })

    return ref.current
}

/*
* Used to perform an asynchronous task only on a mounted component.
*
* EXAMPLE
* function MyComponent(props) {
*     const [state, setState] = useState()
*     const ifMounted = useMounted()
*
*     useEffect(() => {
*         promise.then((value) =>
*             ifMounted(() =>
*                 setState(value)
*             )
*         )
*     }, [])
* }
*/
export function useMounted() {
    const mountedRef = useMountedRef()

    function ifMounted(task: () => void) {
        if (mountedRef.current) {
            task()
        }
    }

    return ifMounted
}

/*
* Used to track the mounted state of a component. Useful inside async tasks.
*
* EXAMPLE
* function MyComponent(props) {
*     const [state, setState] = useState()
*     const mountedRef = useMountedRef()
*
*     useEffect(() => {
*         promise.then((value) =>
*             if (mountedRef.current) {
*                 setState(value)
*             }
*         )
*     }, [])
* }
*/
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

export type PropsOf<T extends ((props: any) => any)> =
    T extends ((props: infer P) => any)
        ? P
        : never

import {isFunction, isNone, type None, type Writable} from '@eviljs/std/type.js'
import {useCallback, useLayoutEffect, useMemo, useRef} from 'react'

export function usePreviousValueRef<T>(value: T): React.MutableRefObject<undefined | T> {
    const oldValueRef = useRef<T>()

    useLayoutEffect(() => {
        function onClean() {
            oldValueRef.current = value
        }

        return onClean
    }, [value])

    return oldValueRef
}

/*
* Used to provide a constant value.
*
* EXAMPLE
*
* function MyComponent(props) {
*     const value = useMemo(() => {...}, [])
*
*     return (
*         <OtherComponent
*             flags={useConstant(['a', 'b', 'c'])}
*             options={useConstant({a: 1, b: 2, c: 3})}
*         />
*     )
* }
*/
export function useConstant<V>(value: V) {
    const ref = useRef(value)
    return ref.current
}

/*
* Used to invoke a closure with updated scope.
*
* EXAMPLE
*
* function MyComponent(props) {
*     const value = useMemo(() => {...}, [])
*
*     const onChange = useClosure(() => {
*         console.log(value)
*     })
*
*     return (
*         <ExpensiveMemoizedComponent onChange={onChange}/>
*     )
* }
*/
export function useClosure<A extends Array<unknown>, R>(closure: (...args: A) => R) {
    const closureRef = useRef(closure)

    useLayoutEffect(() => {
        closureRef.current = closure
    })

    const callback = useCallback((...args: A) => {
        return closureRef.current(...args)
    }, [])

    return callback
}

export function useMergeRefs<V>(...refHandlers: Array<RefHandler<null | V>>) {
    const onRef = useMemo(() => {
        return mergingRefs(...refHandlers)
    }, refHandlers)

    return onRef
}

export function mergingRefs<V>(...refHandlers: Array<RefHandler<null | V>>) {
    function onRef(element: null | V) {
        for (const refHandler of refHandlers) {
            if (isNone(refHandler)) {
                continue
            }
            if (isFunction(refHandler)) {
                refHandler(element)
                continue
            }
            ;(refHandler as Writable<typeof refHandler>).current = element
        }
    }
    return onRef
}

// Types ///////////////////////////////////////////////////////////////////////

export type RefHandler<V> = None | React.MutableRefObject<V> | React.RefObject<V> | React.RefCallback<V>

export interface RefProp<V> {
    onRef?: undefined | RefHandler<V>
}

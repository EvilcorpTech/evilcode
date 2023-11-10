import type {FnArgs} from '@eviljs/std/fn.js'
import {isFunction, isNone, isObject, type None, type Writable} from '@eviljs/std/type.js'
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
export function useClosure<A extends FnArgs, R>(closure: (...args: A) => R) {
    const closureRef = useRef(closure)

    useLayoutEffect(() => {
        closureRef.current = closure
    })

    const callback = useCallback((...args: A) => {
        return closureRef.current(...args)
    }, [])

    return callback
}

export function useMergeRefs<V>(...refs: Array<None | RefHandler<null | V>>) {
    const onRef = useMemo(() => {
        return mergingRefs(...refs)
    }, refs)

    return onRef
}

export function mergingRefs<V>(...refs: Array<None | RefHandler<null | V>>) {
    function onRef(element: null | V) {
        for (const ref of refs) {
            setRef(ref, element)
        }
    }
    return onRef
}

export function setRef<V>(ref: None | RefHandler<V>, value: V): void {
    if (isNone(ref)) {
        return
    }
    if (isFunction(ref)) {
        ref(value)
        return
    }
    if (isObject(ref)) {
        ;(ref as Writable<typeof ref>).current = value
        return
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export type RefHandler<V> = React.MutableRefObject<V> | React.RefObject<V> | React.RefCallback<V>

export interface RefProp<V> {
    onRef?: undefined | RefHandler<V>
}

export type RefValueOf<R extends None | React.Ref<any> | React.ForwardedRef<any>> =
    R extends React.MutableRefObject<infer V>
        ? V
    : R extends React.RefObject<infer V>
        ? V
    : R extends React.RefCallback<infer V>
        ? V
    : R extends None
        ? never
    : never

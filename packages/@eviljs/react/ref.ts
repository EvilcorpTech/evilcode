import {isFunction, isNil, type Writable} from '@eviljs/std/type.js'
import {useCallback, useEffect, useLayoutEffect, useRef} from 'react'

/*
* Used to access the previous volatile value of a prop or state.
*
* EXAMPLE
*
* function MyComponent(props) {
*     const {selected} = props
*     const prevSelected = usePrev(props.selected)
*
*     if (selected !== prevSelected) {
*         console.log('selected changed')
*     }
* }
*/
export function usePreviousValue<T>(value: T) {
    const prevRef = useRef<T>()

    useEffect(() => {
        prevRef.current = value
    })

    return prevRef.current
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

export function mergingRefs<T = any>(...refs: Array<undefined | Ref<T>>) {
    function refProxy(el: T) {
        for (const ref of refs) {
            if (isNil(ref)) {
                continue
            }
            if (isFunction(ref)) {
                ref(el)
                continue
            }
            ;(ref as Writable<typeof ref>).current = el
        }
    }
    return refProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export type Ref<T = any> = React.Ref<T> | React.MutableRefObject<T>

export interface RefProp<V = Element> {
    onRef?: undefined | React.Ref<V>
}

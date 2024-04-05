import type {FnArgs} from '@eviljs/std/fn-type.js'
import {useCallback, useLayoutEffect, useRef} from 'react'

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
*             flags={useConst(['a', 'b', 'c'])}
*             options={useConst({a: 1, b: 2, c: 3})}
*         />
*     )
* }
*/
export function useConst<V>(value: V) {
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

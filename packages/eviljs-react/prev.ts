import {useEffect, useRef} from 'react'

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
export function usePrev<T>(value: T) {
    const prevRef = useRef<T>()

    useEffect(() => {
        prevRef.current = value
    })

    return prevRef.current
}

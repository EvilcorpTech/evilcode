import type {Task} from '@eviljs/std/fn.js'
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react'

export function useMountEffect(effect: Task) {
    useEffect(effect, [])
}

/*
* Used to track the mounted state of a component. Useful inside async tasks.
*
* EXAMPLE
*
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
        mountedRef.current = true // Supports React Fast Refresh.

        function onClean() {
            mountedRef.current = false
        }

        return onClean
    }, [])

    return mountedRef
}


/*
* Used to force the rendering of a component.
*/
export function useRender() {
    const [signal, render] = useRenderSignal()

    return render
}

export function useRenderSignal(): [RenderSignal, Task] {
    const [signal, setSignal] = useState([])

    const notifySignal = useCallback(() => {
        // Don't use -1/1 or !boolean, which don't work on even number of consecutive calls.
        // Don't use ++number, which can overflow Number.MAX_SAFE_INTEGER.
        // [] is faster and memory cheaper
        // than {} which is faster
        // than Object.create(null).
        setSignal([])
    }, [])

    return [signal, notifySignal]
}

// Types ///////////////////////////////////////////////////////////////////////

export type RenderSignal = never[]

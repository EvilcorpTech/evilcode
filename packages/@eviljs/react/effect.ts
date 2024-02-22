import type {Fn, Task} from '@eviljs/std/fn.js'
import {useEffect, useRef} from 'react'

export function useWatch<A extends Array<unknown>>(deps: A, observer: Fn<A, void | Task>) {
    useEffect(() => {
        return observer(...deps)
    }, deps)
}

export function useWatchChange<A extends Array<unknown>>(deps: A, observer: Fn<A, void | Task>) {
    const initRef = useRef(false)

    useEffect(() => {
        if (! initRef.current) {
            initRef.current = true
            return
        }

        return observer(...deps)
    }, deps)
}

// Types ///////////////////////////////////////////////////////////////////////

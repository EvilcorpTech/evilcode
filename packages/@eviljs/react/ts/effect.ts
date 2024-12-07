import type {Fn, Task} from '@eviljs/std/fn-type'
import {useEffect, useRef, type EffectCallback} from 'react'

export function useConditionalEffect(active: boolean, effect: EffectCallback): void {
    useEffect(() => {
        if (! active) {
            return
        }

        return effect()
    }, [active])
}

/*
* useEffect(fn, deps) but with inverted arguments (deps, fn) and deps as function arguments.
*/
export function useWatch<A extends Array<unknown>>(deps: readonly [...A], effect: Fn<NoInfer<A>, void | Task>): void {
    useEffect(() => {
        return effect(...deps)
    }, deps)
}

export function useWatchChange<A extends Array<unknown>>(deps: readonly [...A], effect: Fn<NoInfer<A>, void | Task>): void {
    const initRef = useRef(false)

    useEffect(() => {
        if (! initRef.current) {
            initRef.current = true
            return
        }

        return effect(...deps)
    }, deps)
}

// Types ///////////////////////////////////////////////////////////////////////

import type {Task} from '@eviljs/std/fn-type'
import {useCallback, useState} from 'react'

/*
* Used to force the rendering of a component.
*/
export function useRender(): Task {
    const [signal, render] = useRenderSignal()

    return render
}

export function useRenderSignal(): [RenderSignal, Task] {
    const [signal, setSignal] = useState([])

    const notify = useCallback(() => {
        // Don't use -1/1 or !boolean, which don't work on even number of consecutive calls.
        // Don't use ++number, which can overflow Number.MAX_SAFE_INTEGER.
        // [] is faster and memory cheaper
        // than {} which is faster
        // than Object.create(null).
        setSignal([])
    }, [])

    return [signal, notify]
}

// Types ///////////////////////////////////////////////////////////////////////

export type RenderSignal = never[]

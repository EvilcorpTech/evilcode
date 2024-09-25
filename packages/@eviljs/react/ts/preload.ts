import type {Task} from '@eviljs/std/fn-type'
import {exposePreloadHintElement, type PreloadElementAttrs, type PreloadElementOptions} from '@eviljs/web/preload'
import {useEffect} from 'react'

export type {PreloadElementAttrs} from '@eviljs/web/preload'

export function usePreloadHint(attrs: PreloadElementAttrs, options?: undefined | UsePreloadHintOptions): void {
    const active = options?.active ?? true

    useEffect(() => {
        if (! active) {
            return
        }

        exposePreloadHintElement(attrs, options)
    }, [active])
}

export function usePreloadTask(task: Task<void | undefined | Task>, activeOptional?: undefined | boolean): void {
    const active = activeOptional ?? true

    useEffect(() => {
        if (! active) {
            return
        }

        return task()
    }, [active])
}

// Types ///////////////////////////////////////////////////////////////////////

export interface UsePreloadHintOptions extends PreloadElementOptions {
    active?: undefined | boolean
}

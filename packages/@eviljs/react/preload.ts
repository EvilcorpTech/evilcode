import type {Task} from '@eviljs/std/fn.js'
import {exposePreloadHintElement, type PreloadElementAttrs, type PreloadElementOptions} from '@eviljs/web/preload.js'
import {useEffect} from 'react'

export type {PreloadElementAttrs} from '@eviljs/web/preload.js'

export function usePreloadHint(attrs: PreloadElementAttrs, options?: undefined | UsePreloadHintOptions) {
    const active = options?.active ?? true

    useEffect(() => {
        if (! active) {
            return
        }

        exposePreloadHintElement(attrs, options)
    }, [active])
}

export function usePreloadTask(task: Task<void | undefined | Task>, activeOptional?: undefined | boolean) {
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

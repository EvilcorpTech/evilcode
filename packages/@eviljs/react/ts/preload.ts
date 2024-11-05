import {exposePreloadHintElement, type PreloadElementAttrs, type PreloadElementOptions} from '@eviljs/web/preload'
import {useEffect, type EffectCallback} from 'react'

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

export function usePreloadTask(effect: EffectCallback, activeOptional?: undefined | boolean): void {
    const active = activeOptional ?? true

    useEffect(() => {
        if (! active) {
            return
        }

        return effect()
    }, [active])
}

// Types ///////////////////////////////////////////////////////////////////////

export interface UsePreloadHintOptions extends PreloadElementOptions {
    active?: undefined | boolean
}

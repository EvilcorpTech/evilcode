import type {TaskVoid} from '@eviljs/std/fn.js'
import {asArray} from '@eviljs/std/type.js'
import {useEffect} from 'react'

export function useOnClickOutside(
    selector: string | Array<string>,
    onClickOutside: TaskVoid,
    options?: undefined | OnClickOutsideOptions,
) {
    const active = options?.active ?? true

    useEffect(() => {
        if (! active) {
            return
        }

        function onClick(event: MouseEvent) {
            const target = event.target as null | Partial<Element>
            const selectors = asArray(selector)

            for (const selector of selectors) {
                const isClickInsideTarget = Boolean(target?.closest?.(selector))
                const isClickOutsideTarget = ! isClickInsideTarget

                if (isClickOutsideTarget) {
                    onClickOutside()
                    return
                }
            }
        }

        document.documentElement.addEventListener('click', onClick, {capture: true, passive: true})

        function onClean() {
            document.documentElement.removeEventListener('click', onClick, true)
        }

        return onClean
    }, [active, selector, onClickOutside])
}

// Types ///////////////////////////////////////////////////////////////////////

export interface OnClickOutsideOptions {
    active?: undefined | boolean
}

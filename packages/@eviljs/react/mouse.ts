import type {Task} from '@eviljs/std/fn-type.js'
import {asArray} from '@eviljs/std/type-as.js'
import {useEffect} from 'react'

export function useOnClickOutside(
    selectorList: string | Array<string>,
    onClickOutside: Task,
    options?: undefined | OnClickOutsideOptions,
) {
    const active = options?.active ?? true

    useEffect(() => {
        if (! active) {
            return
        }

        function onClick(event: MouseEvent) {
            const eventTarget = event.target as null | Partial<Element>
            const selectors = asArray(selectorList)

            for (const selector of selectors) {
                const selectedElement = eventTarget?.closest?.(selector)
                const clickIsOutsideSelector = ! selectedElement
                const clickIsInsideSelector = ! clickIsOutsideSelector

                if (clickIsInsideSelector) {
                    // Every selector must match otherwise a click is considered outside.
                    continue
                }

                onClickOutside()
                return
            }
        }

        document.documentElement.addEventListener('click', onClick, {capture: true, passive: true})

        function onClean() {
            document.documentElement.removeEventListener('click', onClick, true)
        }

        return onClean
    }, [selectorList, onClickOutside, active])
}

// Types ///////////////////////////////////////////////////////////////////////

export interface OnClickOutsideOptions {
    active?: undefined | boolean
}

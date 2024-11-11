import {asArray} from '@eviljs/std/type-as'
import {useCallback, useRef} from 'react'
import {useEvent, type EventElement, type EventElementRefMixed, type EventHandler, type EventOptions} from './event.js'

export function useClickOutside(
    refOrRefs: EventElementRefMixed<Element> | Array<EventElementRefMixed<Element>>,
    onClickOutside: EventHandler<MouseEvent>,
    options?: undefined | ClickOutsideOptions,
): void {
    const documentRef = useRef<EventElement>(document.documentElement)
    const rootRef = options?.rootRef ?? documentRef
    const eventName = options?.event ?? 'click'

    useEvent(
        rootRef,
        eventName,
        useCallback((event: MouseEvent) => {
            const eventTarget = event.target as null | Node
            const refs = asArray(refOrRefs)

            if (! eventTarget) {
                onClickOutside(event)
                return
            }

            for (const ref of refs) {
                if (! ref.current) {
                    continue
                }

                const clickIsInside = ref.current.contains(eventTarget)

                if (clickIsInside) {
                    // Click must be inside every ref, otherwise it is considered outside.
                    continue
                }

                onClickOutside(event)
                return
            }
        }, [onClickOutside]),
        options,
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ClickOutsideOptions extends EventOptions {
    event?: undefined | 'click' | 'mousedown' | 'mouseup'
    rootRef?: undefined | EventElementRefMixed
}

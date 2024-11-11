import type {Task} from '@eviljs/std/fn-type'
import {asArray} from '@eviljs/std/type-as'
import {useEffect} from 'react'

export function useClickOutside(
    refOrRefs: ClickOutsideRefMixed,
    onClickOutside: Task,
    options?: undefined | OnClickOutsideOptions,
): void {
    const active = options?.active ?? true

    useEffect(() => {
        if (! active) {
            return
        }

        function onClick(event: MouseEvent) {
            const eventTarget = event.target as null | Node
            const refs = asArray(refOrRefs)

            if (! eventTarget) {
                onClickOutside()
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

                onClickOutside()
                return
            }
        }

        document.documentElement.addEventListener('click', onClick, {capture: true, passive: true})

        function onClean() {
            document.documentElement.removeEventListener('click', onClick, true)
        }

        return onClean
    }, [refOrRefs, onClickOutside, active])
}

// Types ///////////////////////////////////////////////////////////////////////

export interface OnClickOutsideOptions {
    active?: undefined | boolean
}

export type ClickOutsideRefMixed =
    | React.RefObject<Node>
    | React.MutableRefObject<Node>
    | Array<
        | React.RefObject<Node>
        | React.MutableRefObject<Node>
    >

import {call} from '@eviljs/std/fn-call'
import {asArray} from '@eviljs/std/type-as'
import {isSome} from '@eviljs/std/type-is'
import type {None} from '@eviljs/std/type-types'
import {useCallback, useRef} from 'react'
import {useEvent, type EventElement, type EventHandler, type EventOptions} from './event.js'
import type {RefObject} from './ref.js'

export function useEventOutside<E extends Event>(
    refOrRefs: RefObject<None | Element> | Array<RefObject<None | Element>>,
    eventName: string,
    onEventOutside: EventHandler<E>,
    options?: undefined | ClickOutsideOptions,
): void {
    const documentRef = useRef<EventElement>(document.documentElement)
    const behavior = options?.behavior ?? 'every'
    const rootRef = options?.rootRef ?? documentRef

    useEvent(
        rootRef,
        eventName,
        useCallback((event: E) => {
            const eventTarget = event.target as null | Node
            const refs = asArray(refOrRefs)

            if (! eventTarget) {
                onEventOutside(event)
                return
            }

            const refsContainEvent = refs.map(ref => {
                return ref.current?.contains(eventTarget)
            }).filter(isSome)

            const eventIsOutside = call(() => {
                switch (behavior) {
                    // Event can be outside any ref to be considered outside.
                    case 'any': return refsContainEvent.some(it => it === false)
                    // Event must be outside every ref to be considered outside.
                    case 'every': return refsContainEvent.every(it => it === false)
                }
            })

            if (eventIsOutside) {
                onEventOutside(event)
            }
        }, [behavior, onEventOutside]),
        options,
    )
}

export function useClickOutside(
    refOrRefs: RefObject<None | Element> | Array<RefObject<None | Element>>,
    onClickOutside: EventHandler<MouseEvent>,
    options?: undefined | ClickOutsideOptions,
): void {
    const event = options?.event ?? 'click'

    useEventOutside(refOrRefs, event, onClickOutside, options)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface EventOutsideOptions extends EventOptions {
    behavior?: undefined | 'any' | 'every'
    rootRef?: undefined | RefObject<EventElement>
}

export interface ClickOutsideOptions extends EventOutsideOptions {
    event?: undefined | 'click' | 'mousedown' | 'mouseup'
}

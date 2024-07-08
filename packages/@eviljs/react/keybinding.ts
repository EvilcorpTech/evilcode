import {asArray} from '@eviljs/std/type-as.js'
import {useEffect} from 'react'

export function useKey(key: Key, handler: KeyHandler, options?: undefined | UseKeyOptions): void {
    useEffect(() => {
        const keys = asArray(key)
        const el: GlobalEventHandlers = options?.ref?.current ?? document
        const event = options?.event ?? 'keydown'
        const active = options?.active ?? true

        if (! active) {
            return
        }

        const eventOptions: AddEventListenerOptions = {
            capture: options?.phase === 'capturing'
                ? true
                : false // Bubbling by default.
            ,
        }

        function onKey(event: KeyboardEvent) {
            const isTheKey = keys.includes(event.key)

            if (! isTheKey) {
                return
            }

            handler(event)
        }

        el.addEventListener(event, onKey, eventOptions)

        function onClean() {
            el.removeEventListener(event, onKey, eventOptions.capture)
        }

        return onClean
    }, [key, handler, options?.event, options?.phase, options?.active])
}

// Types ///////////////////////////////////////////////////////////////////////

export type Key = string | Array<string> // https://developer.mozilla.org/it/docs/Web/API/KeyboardEvent/key/Key_Values

export interface KeyHandler {
    (event: KeyboardEvent): void
}

export interface UseKeyOptions {
    ref?: undefined | React.RefObject<HTMLElement> | React.MutableRefObject<HTMLElement>
    active?: undefined | boolean
    event?: undefined | 'keyup' | 'keydown'
    phase?: undefined | 'capturing' | 'bubbling'
}

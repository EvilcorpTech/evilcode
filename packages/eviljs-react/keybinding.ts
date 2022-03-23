import {asArray} from '@eviljs/std/type.js'
import {useLayoutEffect} from 'react'

export function useKey(key: Key, handler: KeyHandler, options?: UseKeyOptions) {
    useLayoutEffect(() => {
        const keys = asArray(key)
        const el: GlobalEventHandlers = options?.ref?.current ?? document
        const event = options?.event ?? 'keyup'
        const phase = (() => {
            switch (options?.phase) {
                case 'capturing':
                    return true
                case 'bubbling':
                    return false
                default:
                    return false // bubbling by default.
            }
        })()

        function onKey(event: KeyboardEvent) {
            const isTheKey = keys.includes(event.key)

            if (! isTheKey) {
                return
            }

            handler(event)
        }

        el.addEventListener(event, onKey, phase)

        function onUnmount() {
            el.removeEventListener(event, onKey, phase)
        }

        return onUnmount
    }, [key, handler, options?.event, options?.phase])
}

// Types ///////////////////////////////////////////////////////////////////////

export type Key = string | Array<string> // https://developer.mozilla.org/it/docs/Web/API/KeyboardEvent/key/Key_Values

export interface KeyHandler {
    (event: KeyboardEvent): void
}

export interface UseKeyOptions {
    ref?: undefined | React.RefObject<HTMLElement> | React.MutableRefObject<HTMLElement>
    event?: undefined | 'keyup' | 'keydown'
    phase?: undefined | 'capturing' | 'bubbling'
}

import {asArray} from '@eviljs/std/type.js'
import {useEffect} from 'react'

export function useKey(key: Key, handler: KeyHandler, options?: UseKeyOptions) {
    const keys = asArray(key)

    useEffect(() => {
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

        function unmount() {
            document.removeEventListener(event, onKey, phase)
        }

        document.addEventListener(event, onKey, phase)

        return unmount
    }, [handler])
}

// Types ///////////////////////////////////////////////////////////////////////

export type Key = string | Array<string> // https://developer.mozilla.org/it/docs/Web/API/KeyboardEvent/key/Key_Values

export interface KeyHandler {
    (event: KeyboardEvent): void
}

export interface UseKeyOptions {
    event?: 'keyup' | 'keydown'
    phase?: 'capturing' | 'bubbling'
}

import {asArray} from '@eviljs/std/type-as'
import {useCallback, useRef} from 'react'
import {useEvent, type EventElementRefMixed, type EventHandler, type EventOptions} from './event.js'

export function useKey(
    key: KeybindingKey,
    onKey: EventHandler<KeyboardEvent>,
    options?: undefined | KeybindingOptions,
): void {
    const documentRef = useRef(document)
    const event = options?.event ?? 'keydown'
    const ref = options?.ref ?? documentRef

    useEvent(
        ref,
        event,
        useCallback((event: KeyboardEvent) => {
            const keys = asArray(key)
            const isTheKey = keys.includes(event.key)

            if (! isTheKey) {
                return
            }

            onKey(event)
        }, [key, onKey]),
        options,
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export type KeybindingKey = string | Array<string> // https://developer.mozilla.org/it/docs/Web/API/KeyboardEvent/key/Key_Values

export interface KeybindingOptions extends EventOptions {
    event?: undefined | 'keyup' | 'keydown'
    ref?: undefined | EventElementRefMixed | Array<EventElementRefMixed>
}

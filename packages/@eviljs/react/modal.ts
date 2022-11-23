// See `@evilcss/std/modal.classes.css`.

import {useEffect} from 'react'

export function useScrollLockAuto() {
    useEffect(() => {
        lockScroll()

        return unlockScroll
    }, [])
}

export function useScrollLockToggle(locked: boolean) {
    useEffect(() => {
        if (locked) {
            lockScroll()
        }
        else {
            unlockScroll()
        }

        return unlockScroll
    }, [locked])
}

export function lockScroll() {
    document.scrollingElement?.setAttribute('no-scroll', '')
}

export function unlockScroll() {
    document.scrollingElement?.removeAttribute('no-scroll')
}

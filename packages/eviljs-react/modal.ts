import {useEffect} from 'react'

import '@evilcss/std/modal.css'

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

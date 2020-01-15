import { useState } from 'react'

export function useBusy() {
    const [ busy, setBusy ] = useState(0)

    function busyLock() {
        setBusy(state => state + 1)
    }
    function busyRelease() {
        setBusy(state => state - 1)
    }

    return [busy, busyLock, busyRelease, setBusy] as const
}
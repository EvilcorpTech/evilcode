import {useState} from 'react'

export function useBusy(init = 0) {
    const [busy, setBusy] = useState(init)
    const isBusy = busy > 0

    function busyLock() {
        setBusy(state => state + 1)
    }
    function busyRelease() {
        setBusy(state => state - 1)
    }

    return {busy, isBusy, busyLock, busyRelease, setBusy}
}

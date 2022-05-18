import {useState} from 'react'

export function useBusyLock(initial?: undefined | number) {
    const [busy, setBusy] = useState(initial ?? 0)
    const isBusy = busy > 0

    function busyLock() {
        setBusy(state => state + 1)
    }
    function busyRelease() {
        setBusy(state => state - 1)
    }

    return {busy, isBusy, busyLock, busyRelease, setBusy}
}

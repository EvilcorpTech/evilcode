import {useCallback, useState} from 'react'

export function useBusyLock(initial?: undefined | number): BusyLockManager {
    const [busy, setBusy] = useState(initial ?? 0)
    const isBusy = busy > 0

    const busyLock = useCallback(() => {
        setBusy(state => state + 1)
    }, [])
    const busyRelease = useCallback(() => {
        setBusy(state => state - 1)
    }, [])

    return {busy, isBusy, busyLock, busyRelease, setBusy}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BusyLockManager {
    busy: number
    isBusy: boolean
    busyLock(): void
    busyRelease(): void
    setBusy: React.Dispatch<React.SetStateAction<number>>
}

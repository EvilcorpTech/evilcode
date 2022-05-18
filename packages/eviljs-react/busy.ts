import {useState} from 'react'
import {useDebounce} from './event.js'

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

export function useBusyDebounced(
    delay: number,
    initial?: undefined | boolean,
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
    const [busy, setBusy] = useState(initial ?? false)
    const setBusyDebounced = useDebounce(setBusy, delay)

    return [busy, setBusyDebounced]
}

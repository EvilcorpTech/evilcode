import React from 'react'
const {useState} = React

export function useBusy(init = 0) {
    const [busy, setBusy] = useState(init)

    function busyLock() {
        setBusy(state => state + 1)
    }
    function busyRelease() {
        setBusy(state => state - 1)
    }

    return {busy, busyLock, busyRelease, setBusy}
}

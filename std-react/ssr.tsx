import React from 'react'
const {useEffect} = React

export function useSsrState<S>(id: string, onLoad: SsrStateSetter<S>, onMissing?: () => void) {
    const ssrId = 'std-ssr-' + id

    useEffect(() => {
        // We try deriving the state from the SSR serialized payload.
        // We need to derive the state inside an effect instead of inside
        // the render function because the callback can mutate a different component.
        const state = (() => {
            try {
                return loadSsrState<S>(ssrId)
            }
            catch (error) {
                console.log(error)
                return // Makes TypeScript happy.
            }
        })()

        if (! state) {
            onMissing?.()
            return
        }

        onLoad(state)
    }, [])

    function save(state: S) {
        saveSsrState(ssrId, state)
    }

    return save
}

export function saveSsrState(id: string, payload: any) {
    if (! payload) {
        return
    }
    const serializedPayload = JSON.stringify(payload)
    const ssrStorage = findSsrStorageElement(id) ?? injectSsrStorageElement(id)

    ssrStorage.textContent = serializedPayload
}

export function loadSsrState<S = unknown>(id: string) {
    const ssrStorage = findSsrStorageElement(id)
    const serializedPayload = ssrStorage?.textContent?.trim()

    if (! serializedPayload) {
        return
    }

    return JSON.parse(serializedPayload) as S
}

export function findSsrStorageElement(id: string) {
    const selector = '#' + id
    return document.head.querySelector(selector)
}

export function injectSsrStorageElement(id: string) {
    const el = document.createElement('script')
    el.type = 'application/json'
    el.id = id
    document.head.appendChild(el)
    return el
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SsrStateSetter<S> {
    (state: S): void
}

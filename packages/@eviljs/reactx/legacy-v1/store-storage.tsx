import {noop} from '@eviljs/std/fn-return'
import {tryCatch} from '@eviljs/std/fn-try'
import type {Io} from '@eviljs/std/fn-type'
import {isObject} from '@eviljs/std/type-is'
import {useEffect, useRef} from 'react'

export const StoreStorageDefaultAdapter: Storage = globalThis.localStorage
export const StoreStorageDefaultDebounce = 1000
export const StoreStorageDefaultKey = '@eviljs/react/store-storage.state'
export const StoreStorageDefaultVersion = '1'

export function useStoreStorage<S, L = S>(state: S, options: StoreStorageOptions<S, L>): void {
    const {onLoad, onMissing, onSave} = options
    const debounce = options.debounce ?? StoreStorageDefaultDebounce
    const stateVersion = options.stateVersion ?? StoreStorageDefaultVersion
    const storage = options.storage ?? StoreStorageDefaultAdapter
    const storageKey = options.storageKey ?? StoreStorageDefaultKey
    const loadedRef = useRef(false)

    useEffect(() => {
        // We use a ref avoiding triggering a re-render if not needed.
        loadedRef.current = true

        if (! storage) {
            return
        }
        if (! onLoad && ! onMissing) {
            return
        }

        // We try deriving the state from LocalStorage.
        // We need to derive the state inside an effect instead of inside
        // the render function because we are mutating a different component.

        const payload = loadJsonFromStorage(storage, storageKey) as undefined | Record<PropertyKey, L>

        if (! payload || ! isObject(payload) || ! payload[stateVersion]) {
            onMissing?.()
            return
        }

        const savedState = payload[stateVersion]

        onLoad?.(savedState as L)
    }, [])

    useEffect(() => {
        if (! storage) {
            return
        }
        if (! loadedRef.current) {
            // We can't save the state yet.
            return
        }

        function saveState() {
            const savedState = onSave?.(state) ?? state
            const payload = {[stateVersion]: savedState}

            function trySaving(onError: Io<unknown, void>) {
                tryCatch(
                    () => saveJsonToStorage(storage, storageKey, payload),
                    onError,
                )
            }

            trySaving(error => {
                // The serialization could fail or we could exceed the storage quota.
                console.warn(error)

                if (! (error instanceof DOMException)) {
                    return
                }

                // One more attempt.
                storage.clear() // But clearing the storage first.
                trySaving(noop)
            })
        }

        // We debounce the Storage saving.
        const timeoutId = setTimeout(saveState, debounce)

        function onClean() {
            clearTimeout(timeoutId)
        }

        return onClean
    }, [state])
}

/**
* @throws DOMException
*/
export function saveJsonToStorage(storage: Storage, key: string, payload: unknown): void {
    if (! payload) {
        return
    }

    const serializedPayload = JSON.stringify(payload)
    storage.setItem(key, serializedPayload)
}

export function loadJsonFromStorage(storage: Storage, key: string): unknown {
    const serializedPayload = storage.getItem(key)

    if (! serializedPayload) {
        return
    }

    try {
        return JSON.parse(serializedPayload) as unknown
    }
    catch (error) {
        console.warn(error)
    }
    return // Makes TypeScript happy.
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreStorageOptions<S, L> {
    debounce?: undefined | number
    stateVersion?: undefined | number | string
    storage?: undefined | Storage
    storageKey?: undefined | string
    onLoad?: undefined | StoreStorageOnLoad<L>,
    onMissing?: undefined | (() => void)
    onSave?: undefined | StoreStorageOnSave<S, L>
}

export interface StoreStorageOnLoad<L> {
    (savedState: L): void
}

export interface StoreStorageOnSave<S, L = S> {
    (state: S): L
}

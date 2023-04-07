import type {TryOnError} from '@eviljs/std/try.js'
import {tryCatch} from '@eviljs/std/try.js'
import {isObject} from '@eviljs/std/type.js'
import {useEffect, useRef} from 'react'

export const StoreStorageDefaultAdapter = globalThis.localStorage
export const StoreStorageDefaultDebounce = 1000
export const StoreStorageDefaultKey = '@eviljs/react/store-storage.state'
export const StoreStorageDefaultVersion = '1'

export function useRootStoreStorage<S, L = S>(state: S, options: StoreStorageOptions<S, L>) {
    const {onLoad, onMissing, onSave} = options
    const debounce = options.debounce ?? StoreStorageDefaultDebounce
    const stateVersion = options.stateVersion ?? StoreStorageDefaultVersion
    const storage = options.storage ?? StoreStorageDefaultAdapter
    const storageKey = options.storageKey ?? StoreStorageDefaultKey
    const loadedRef = useRef(false)

    useEffect(() => {
        if (! storage) {
            return
        }
        if (! onLoad && ! onMissing) {
            return
        }

        // We try deriving the state from LocalStorage.
        // We need to derive the state inside an effect instead of inside
        // the render function because we are mutating a different component.

        // We use a ref avoiding triggering a re-render if not needed.
        loadedRef.current = true

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

        // We debounce the Storage saving.
        const timeoutId = setTimeout(() => {
            const savedState = onSave?.(state) ?? state
            const payload = {[stateVersion]: savedState}

            function trySaving<F>(onError?: undefined | TryOnError<F>) {
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
                trySaving()
            })
        }, debounce)

        function onClean() {
            clearTimeout(timeoutId)
        }

        return onClean
    }, [state])
}

/**
* @throws DOMException
*/
export function saveJsonToStorage(storage: Storage, key: string, payload: unknown) {
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

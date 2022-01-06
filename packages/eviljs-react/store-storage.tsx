import {useEffect, useRef} from 'react'

export function useRootStoreStorage<S, L = S>(state: S, options: StoreStorageOptions<S, L>) {
    const {onLoad, onMissing, onSave} = options
    const debounce = options.debounce ?? 0
    const version = options.version ?? 1
    const storageType = options.storage ?? 'localStorage'
    const storageKey = options.storageKey ?? 'store-state-v' + version
    const storage = window[storageType] as undefined | Storage
    const isLoadedRef = useRef(false)

    useEffect(() => {
        if (! storage) {
            return
        }

        // We try deriving the state from LocalStorage.
        // We need to derive the state inside an effect instead of inside
        // the render function because we are mutating a different component.
        isLoadedRef.current = true
        // we use a ref avoiding triggering a re-render if not needed.

        const savedState = loadStateFromStorage<L>(storage, storageKey)

        if (! savedState) {
            // We don't have a saved state. We have nothing to do.
            onMissing?.()
            return
        }

        onLoad(savedState, state)
    }, [])

    useEffect(() => {
        if (! storage) {
            return
        }

        if (! isLoadedRef.current) {
            // We can't save the state yet.
            return
        }

        // We debounce the Storage saving.
        const timeoutId = setTimeout(() => {
            const savedState = onSave?.(state) ?? state

            saveStateToStorage(storage, storageKey, savedState)
        }, debounce)

        function unmount() {
            clearTimeout(timeoutId)
        }

        return unmount
    }, [state])
}

export function saveStateToStorage(storage: Storage, key: string, state: unknown) {
    if (! state) {
        return
    }

    const serializedState = JSON.stringify(state)

    storage.setItem(key, serializedState)
}

export function loadStateFromStorage<S = unknown>(storage: Storage, key: string) {
    const serializedState = storage.getItem(key)

    if (! serializedState) {
        return
    }

    return JSON.parse(serializedState) as S
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreStorageOptions<S extends {}, L extends {}> {
    debounce?: undefined | number
    version?: undefined | number | string
    storage?: undefined | 'localStorage' | 'sessionStorage'
    storageKey?: undefined | string
    onLoad: StoreStorageOnLoad<S, L>,
    onMissing?: undefined | (() => void)
    onSave?: undefined | StoreStorageOnSave<S, L>
}

export interface StoreStorageOnLoad<S, L> {
    (savedState: L, state: S): void
}

export interface StoreStorageOnSave<S, L = S> {
    (state: S): L
}

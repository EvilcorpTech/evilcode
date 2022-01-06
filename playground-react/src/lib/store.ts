import {loadStateFromStorage} from '@eviljs/react/store-storage'
import {loadSsrState} from '@eviljs/web/ssr'

export const StateVersion = 1
export const StoreSpec = {createState}
export const StoreStateStorageId = 'AppState-' + StateVersion
export const StoreStateSsrId = StoreStateStorageId
export const Storage: Storage = window.localStorage

export function createState(): State {
    const initialState = createInitialState()
    const storageState = loadStateFromStorage<State>(Storage, StoreStateStorageId)
    const ssrState = loadSsrState<State>(StoreStateSsrId)

    if (storageState) {
        console.debug('app:', 'store state restored from LocalStorage')
        return mergeState(initialState, storageState)
    }

    if (ssrState) {
        console.debug('app:', 'store state restored from SsrStorage')
        return mergeState(initialState, ssrState)
    }

    return initialState
}

export function createInitialState(): State {
    return {
        __cache__: {},
        theme: null,
        token: null,
    }
}

export function mergeState(state: State, savedState: State) {
    return {
        // We overwrite the base state...
        ...state,
        // ...skipping those fields already initialized.
        // account: state.account ?? savedState.account ?? null,
    }
}

export function filterStorageState(state: State) {
    return {
        // Shallow clone.
        ...state,
        __cache__: {}, // Cache Metadata must not persist.
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface State {
    __cache__: StateCache
    theme: null | 'light' | 'dark'
    token: null | string
}

export type StateCache = {
    [key in StateKey]?: boolean
}

export type StateKey = Exclude<keyof State, '__cache__'>

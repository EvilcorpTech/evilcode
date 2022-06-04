import {loadSsrState} from '@eviljs/web/ssr'
import {Version} from './context'

export const StoreStateVersion = Version.replaceAll('.', '-')
export const StoreSpec = {actions: {}, createState}
export const StoreStateSsrId = 'AppState-' + StoreStateVersion
export const Storage: Storage = window.localStorage

export function createState(): StoreState {
    const initialState = createInitialState()
    const ssrState = loadSsrState<StoreState>(StoreStateSsrId)

    if (ssrState) {
        console.debug('app:', 'store state restored from SsrStorage')
        return mergeState(initialState, ssrState)
    }

    return initialState
}

export function createInitialState(): StoreState {
    return {
        __cache__: {},
        theme: null,
        token: null,
    }
}

export function mergeState(state: StoreState, savedState: StoreState) {
    return {
        // We overwrite the base state...
        ...state,
        // ...skipping those fields already initialized.
        theme: state.theme ?? savedState.theme ?? null,
        token: state.token ?? savedState.token ?? null,
    }
}

export function filterStorageState(state: StoreState) {
    return {
        // Shallow clone.
        ...state,
        __cache__: {}, // Cache Metadata must not persist.
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreState {
    __cache__: StoreStateCache
    theme: null | 'light' | 'dark'
    token: null | string
}

export type StoreStateCache = {
    [key in StoreStateKey]?: boolean
}

export type StoreStateKey = Exclude<keyof StoreState, '__cache__'>

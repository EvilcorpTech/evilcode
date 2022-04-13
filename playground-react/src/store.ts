import {loadSsrState} from '@eviljs/web/ssr'
import {Version} from './context'

export const StateVersion = Version.replaceAll('.', '-')
export const StoreSpec = {actions: {}, createState}
export const StoreStateSsrId = 'AppState-' + StateVersion
export const Storage: Storage = window.localStorage

export function createState(): State {
    const initialState = createInitialState()
    const ssrState = loadSsrState<State>(StoreStateSsrId)

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
        theme: state.theme ?? savedState.theme ?? null,
        token: state.token ?? savedState.token ?? null,
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

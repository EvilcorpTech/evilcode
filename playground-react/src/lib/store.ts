import {loadStateFromStorage, setAction, StoreActionValueComputer} from '@eviljs/std-react/store'
import {loadSsrState} from '@eviljs/std-web/ssr'

export const StateVersion = 1
export const Actions = {setCache}
export const StoreSpec = {actions: Actions, createState}
export const StoreStateStorageId = 'AppState-' + StateVersion
export const StoreStateSsrId = StoreStateStorageId
export const Storage: Storage | undefined = window.localStorage

export const StorageState = loadStateFromStorage<State>(Storage, StoreStateStorageId)
export const SsrState = loadSsrState<State>(StoreStateSsrId)

export function createState(): State {
    const initialState = createInitialState()

    if (StorageState) {
        console.debug('app:', 'store state restored from LocalStorage')
        return mergeState(initialState, StorageState)
    }

    if (SsrState) {
        console.debug('app:', 'store state restored from SsrStorage')
        return mergeState(initialState, SsrState)
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

export function mergeState(state: State, savedState: SavedState) {
    return {
        // We overwrite the base state...
        ...state,
        // ...skipping those fields already initialized.
        // account: state.account ?? savedState.account ?? null,
    }
}

export function filterStorageState(state: State) {
    const savedState: SavedState = {...state} // Shallow clone.
    delete savedState.__cache__ // Cache Metadata must not persist.
    return savedState
}

export function setCache(state: State, stateCache: StoreActionValueComputer<StateCache, Partial<StateCache>>) {
    return {
        ...state,
        __cache__: setAction(state.__cache__, stateCache),
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export type Actions = typeof Actions

export interface State {
    __cache__: StateCache
    theme: null | 'light' | 'dark'
    token: null | string
}

export interface SavedState extends Partial<State> {
}

export type StateCache = {
    [key in StateKey]?: boolean
}

export type StateKey = Exclude<keyof State, '__cache__'>

import type {OnChangeEventArgs, StoreSpec as StdStoreSpec} from '@eviljs/react/store'
import {Version} from '~/env/apis'
import type {Theme} from '~/theme/apis'

export const StoreStateVersion = Version.replaceAll('.', '-')
export const StoreSpec: StdStoreSpec<StoreState> = {createState, onChange}
export const StoreStateSsrId = 'AppState-' + StoreStateVersion
export const Storage: Storage = window.localStorage

export function createState(): StoreState {
    return {}
}

export function onChange(args: OnChangeEventArgs) {
    console.log('Store change:', args)
}

export function mergeStorageState(state: StoreState, savedState: StoreState) {
    return {
        // We overwrite the base state...
        ...state,
        // ...skipping those fields already initialized.
        theme: state.theme ?? savedState.theme,
        token: state.token ?? savedState.token,
    }
}

export function filterStorageState(state: StoreState) {
    return {
        // Shallow clone.
        ...state,
        cache: {}, // Cache Metadata must not persist.
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreState {
    theme?: undefined | Theme
    token?: undefined | string
}

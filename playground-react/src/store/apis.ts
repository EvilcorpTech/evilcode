import type {Theme} from '~/theme/apis'

export const StoreStateVersion = 1

export function createState(): StoreState {
    return {}
}

export function mergeStorageState(state: StoreState, savedState: StoreStateSaved): StoreState {
    return {
        // We overwrite the base state...
        ...state,
        // ...skipping those fields already initialized.
        theme: state.theme ?? savedState.theme,
        token: state.token ?? savedState.token,
    }
}

export function filterStorageState(state: StoreState): StoreStateSaved {
    return {
        // Shallow clone.
        ...state,
        data: {},
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreState {
    theme?: undefined | Theme
    token?: undefined | string
    data?: {
        something?: undefined | Array<string>
    }
}

export interface StoreStateSaved extends Partial<StoreState> {
}

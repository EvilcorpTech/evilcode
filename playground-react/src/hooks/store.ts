import {StoreStorageOptions} from '@eviljs/react/store-v1'
import {filterStorageState, mergeState, State, StateVersion} from '../store'

export {type Store, useStore} from '@eviljs/react/store'
export {type State} from '../store'

export const StoreStorageSpec: StoreStorageOptions<State, State> = {
    stateVersion: StateVersion,
    debounce: 5000,
    onLoad() {
        console.debug('app:', 'store state restored from LocalStorage')
    },
    onMerge(savedState, state) {
        return mergeState(state, savedState)
    },
    onSave: filterStorageState,
}

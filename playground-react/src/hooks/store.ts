import {StoreStorageOptions} from '@eviljs/react/store-v1'
import {filterStorageState, mergeState, StoreState, StoreStateVersion} from '../store'

export {type Store, useStore} from '@eviljs/react/store'
export {type StoreState} from '../store'

export const StoreStorageSpec: StoreStorageOptions<StoreState, StoreState> = {
    stateVersion: StoreStateVersion,
    debounce: 5000,
    onLoad() {
        console.debug('app:', 'store state restored from LocalStorage')
    },
    onMerge(savedState, state) {
        return mergeState(state, savedState)
    },
    onSave: filterStorageState,
}

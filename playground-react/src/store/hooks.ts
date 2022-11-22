import {useStoreState} from '@eviljs/react/store'
import {useRootStoreStorage as useStdRootStoreStorage} from '@eviljs/react/store-storage'
import {filterStorageState, mergeStorageState, StoreStateVersion, type StoreState} from './apis'

export {useStoreState, type Store} from '@eviljs/react/store'
export type {StoreState} from './apis'

export function useRootStoreStorage() {
    const [state, setState] = useStoreState<StoreState>()

    useStdRootStoreStorage(state, {
        stateVersion: StoreStateVersion,
        debounce: 5000,
        onLoad(savedState) {
            const nextState = mergeStorageState(state, savedState)

            setState(nextState)

            console.debug('app:', 'store state restored from LocalStorage')
        },
        onSave: filterStorageState,
    })
}

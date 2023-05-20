import {useRootStoreStorage as useStdRootStoreStorage} from '@eviljs/react/store-storage'
import {useStoreState as useStoreStateV3} from '@eviljs/react/store-v3'
import type {StoreState} from './apis'
import {filterStorageState, mergeStorageState, StoreStateVersion} from './apis'

export {useStoreState as useStoreStateV3} from '@eviljs/react/store-v3'
export {useStoreDispatch as useStoreDispatchV4, useStoreState as useStoreStateV4, useStore as useStoreV4} from '@eviljs/react/store-v4'

export const Storage: Storage = window.localStorage

export function useRootStoreStorage() {
    const [storeV3State, storeV3SetState] = useStoreStateV3<StoreState>()

    useStdRootStoreStorage(storeV3State, {
        stateVersion: StoreStateVersion + '-v3',
        storage: Storage,
        debounce: 5000,
        onLoad(savedState) {
            const nextState = mergeStorageState(storeV3State, savedState)

            storeV3SetState(nextState)

            console.debug('app:', 'store v3 state restored from LocalStorage')
        },
        onSave: filterStorageState,
    })
}

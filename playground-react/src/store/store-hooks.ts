import {useStoreStorage as useStdStoreStorage} from '@eviljs/react/store-storage'
import {setState} from '~/store/store-v3-apis'
import {useStore} from '~/store/store-v3-hooks'
import {filterStorageState, mergeStorageState, StoreStateVersion} from './store-apis'

export const Storage: Storage = window.localStorage

export function useStoreStorage() {
    const [storeState, dispatch] = useStore()

    useStdStoreStorage(storeState, {
        stateVersion: StoreStateVersion,
        storage: Storage,
        debounce: 5000,
        onLoad(savedState) {
            const nextState = mergeStorageState(storeState, savedState)

            dispatch(setState(nextState))

            console.debug('app: store state restored from LocalStorage')
        },
        onSave: filterStorageState,
    })
}

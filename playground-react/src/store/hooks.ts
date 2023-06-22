import {useRootStoreStorage as useStdRootStoreStorage} from '@eviljs/react/store-storage'
import {setState} from '~/store-v3/apis'
import {useStore} from '~/store-v3/hooks'
import {filterStorageState, mergeStorageState, StoreStateVersion} from './apis'

export const Storage: Storage = window.localStorage

export function useRootStoreStorage() {
    const [storeState, dispatch] = useStore()!

    useStdRootStoreStorage(storeState, {
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

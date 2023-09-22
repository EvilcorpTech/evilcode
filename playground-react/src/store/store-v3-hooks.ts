import {defineContext} from '@eviljs/react/ctx'
import {createStore, type StoreManager} from '@eviljs/react/store'
import type {StoreState} from '~/store/store-apis'

export const StoreContext = defineContext<StoreManager<StoreState>>('StoreContext')

export const {StoreProvider, useStore, useStoreDispatch, useStoreState} = createStore(StoreContext)

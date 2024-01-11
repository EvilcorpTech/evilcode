import {setupStore} from '@eviljs/react/store'
import type {StoreState} from '~/store/store-apis'

export const {StoreProvider, useStore, useStoreDispatch, useStoreState} = setupStore<StoreState>()

import {defineContext} from '@eviljs/react/ctx'
import {createStoreBound, type StoreManager} from '@eviljs/react/store'
import type {StoreState} from '~/store/apis'

export const StoreContext = defineContext<StoreManager<StoreState>>('StoreContext')

export const {useStore, useStoreDispatch, useStoreState} = createStoreBound(StoreContext)

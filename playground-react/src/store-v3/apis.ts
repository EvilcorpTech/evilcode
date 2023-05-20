import type {OnChangeEventArgs, StoreSpec as StdStoreSpecV3} from '@eviljs/react/store-v3'
import {createState, type StoreState} from '~/store/apis'

export const StoreSpec: StdStoreSpecV3<StoreState> = {
    createState,
    onChange,
}

export function onChange(args: OnChangeEventArgs) {
    console.log('StoreV3 change:', args)
}

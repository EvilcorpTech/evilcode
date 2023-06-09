import type {OnChangeEventArgs, StoreDefinition} from '@eviljs/react/store-v4'
import {createState, type StoreState} from '~/store/apis'

export const StoreSpec: StoreDefinition<StoreState> = {
    createState,
    onChange,
}

export function onChange(args: OnChangeEventArgs) {
    console.log('StoreV3 change:', args)
}

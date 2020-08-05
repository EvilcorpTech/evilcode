import {isFunction} from '@eviljs/std-lib/type'
import {useStore as useStdStore, Store, StoreActions} from '@eviljs/std-react/store'

export const Actions = {set}
export const StoreSpec = {actions: Actions, createState}

export function useStore() {
    return useStdStore() as Store<State, StoreActions<typeof Actions>>
}

export function createState(): State {
    return {
        account: null,
    }
}

export function set(state: State, value: Partial<State> | React.SetStateAction<State>) {
    return {
        ...state, // Old state.
        ...isFunction(value)
            ? value(state) // New computed state.
            : value // New provided state.
        ,
    }
}


// Types ///////////////////////////////////////////////////////////////////////

export interface State {
    account: null | {
        id: string
        firstName: string
        lastName: string
        avatar: string
    }
}

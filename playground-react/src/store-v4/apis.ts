import {
    composeReducers,
    defineReducerAction,
    fromActionsDefinitions,
    patchState,
    withId,
    type ReducerActionOfDict,
    type ReducerArgs,
    type ReducerId,
    type StoreSpec as StdStoreSpecV4,
    type StoreStatePatch,
} from '@eviljs/react/store-v4'
import {createState, type StoreState} from '~/store/apis'

export const StoreActionsSpec = {
    SetState: defineReducerAction(withId('setState'), patchState<StoreState>),
    ResetState: defineReducerAction(withId('resetState'), reduceStateReset),
    SetData: defineReducerAction(withId('setData'), reduceStateData),
}

export const StoreSpec: StdStoreSpecV4<StoreState, StoreAction> = {
    createState,
    reduce: composeReducers(...fromActionsDefinitions(StoreActionsSpec)),
    onDispatch,
}

export function onDispatch(id: ReducerId, ...args: ReducerArgs) {
    console.log('StoreV4 change:', id, args)
}

export const setState = StoreActionsSpec.SetState.action
export const resetState = StoreActionsSpec.ResetState.action
export const setData = StoreActionsSpec.SetData.action

export function reduceStateReset(state: StoreState): StoreState {
    return createState()
}

export function reduceStateData(state: StoreState, statePatch: StoreStatePatch<NonNullable<StoreState['data']>>): StoreState {
    const data = patchState(state.data ?? {}, statePatch)

    return state.data !== data
        ? {...state, data}
        : state
}

// Types ///////////////////////////////////////////////////////////////////////

export type StoreAction = ReducerActionOfDict<typeof StoreActionsSpec>

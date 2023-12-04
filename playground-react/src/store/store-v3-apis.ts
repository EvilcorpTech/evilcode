import {
    composeReducers,
    defineReducerAction,
    fromActionsDefinitions,
    patchState,
    withId,
    type ReducerActionOfDict,
    type ReducerArgs,
    type ReducerId,
    type StoreDefinition,
    type StoreStatePatch,
} from '@eviljs/react/store'
import {Env} from '~/env/env-specs'
import {createState, type StoreState} from '~/store/store-apis'

export const StoreActionsSpec = {
    SetState: defineReducerAction(withId('SetState'), patchState<StoreState>),
    ResetState: defineReducerAction(withId('ResetState'), reduceStateReset),
    SetData: defineReducerAction(withId('SetData'), reduceStateSetData),
}

export const StoreSpec: StoreDefinition<StoreState, StoreAction> = {
    createState,
    reduce: composeReducers(...fromActionsDefinitions(StoreActionsSpec)),
    onDispatch,
}

export function onDispatch(id: ReducerId, args: ReducerArgs, newState: StoreState, oldState: StoreState) {
    if (Env.Mode === 'production') {
        return
    }

    if (newState === oldState) {
        console.groupCollapsed('StoreV3: state did\'t change')
        console.debug('state:', newState)
        console.debug('id:', id)
        console.debug('args:', args)
        console.groupEnd()
        return
    }

    console.groupCollapsed('StoreV3: state did change')
    console.debug('to:', newState)
    console.debug('from:', oldState)
    console.debug('id:', id)
    console.debug('args:', args)
    console.groupEnd()
}

export const setState = StoreActionsSpec.SetState.action
export const resetState = StoreActionsSpec.ResetState.action
export const setData = StoreActionsSpec.SetData.action

export function reduceStateReset(state: StoreState): StoreState {
    return createState()
}

export function reduceStateSetData(state: StoreState, statePatch: StoreStatePatch<NonNullable<StoreState['data']>>): StoreState {
    const data = patchState(state.data ?? {}, statePatch)

    return state.data !== data
        ? {...state, data}
        : state
}

// Types ///////////////////////////////////////////////////////////////////////

export type StoreAction = ReducerActionOfDict<typeof StoreActionsSpec>

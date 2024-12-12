import {
    ReduxActions,
    ReduxReducer,
    defineReduxAction,
    patchState,
    setupStore,
    withId,
    type ReduxEvent,
    type ReduxReducerArgs,
    type ReduxReducerId,
    type ReduxStatePatch,
    type StoreDefinition,
} from '@eviljs/react/store'
import {Env} from '/env/env-specs'
import {createState, type StoreState} from '/store/store-state'

export const DemoStoreActionsSpec = {
    setState: defineReduxAction(withId('setState'), patchState<StoreState>),

    resetState: defineReduxAction(withId('resetState'), (
        state: StoreState,
    ): StoreState => {
        return createState()
    }),

    setData: defineReduxAction(withId('setData'), (
        state: StoreState,
        statePatch: ReduxStatePatch<NonNullable<StoreState['data']>>,
    ): StoreState => {
        const data = patchState(state.data ?? {}, statePatch)

        return state.data !== data
            ? {...state, data}
            : state
    }),
}

export const DemoStoreSpec: StoreDefinition<StoreState, ReduxEvent> = {
    createState,
    reduce: ReduxReducer.fromActions(DemoStoreActionsSpec),
    observer: storeObserver,
}

export const DemoStore = {
    Action: ReduxActions.objectFrom(DemoStoreActionsSpec),
}

export function storeObserver(id: ReduxReducerId, args: ReduxReducerArgs, newState: StoreState, oldState: StoreState) {
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

export const {
    StoreContext: DemoStoreContext,
    StoreProvider: DemoStoreProvider,
    useStore: useDemoStore,
    useStoreContext: useDemoStoreContext,
    useStoreDispatch: useDemoStoreDispatch,
    useStoreProvider: useDemoStoreProvider,
    useStoreRead: useDemoStoreRead,
    useStoreState: useDemoStoreState,
} = setupStore<StoreState>({
    contextName: 'DemoStoreContext',
})

import {createReactiveAccessor, type ReactiveAccessor} from '@eviljs/std/reactive-accessor.js'
import {actionFromPolymorphicArgs, type ReducerAction, type ReducerPolymorphicAction, type ReducerState} from '@eviljs/std/redux.js'
import {useContext, useMemo} from 'react'
import {defineContext} from './ctx.js'
import type {StoreDefinitionV2, StoreDispatchV2} from './store-v2.js'

export const StoreContext = defineContext<StoreManager>('StoreContext')

/*
* EXAMPLE
*
* export function MyMain(props) {
*     return (
*         <StoreProvider createState={createState} reduce={reduce}>
*             <MyApp/>
*         </StoreProvider>
*     )
* }
*/
export function StoreProvider<S extends ReducerState, A extends ReducerAction>(props: StoreProviderProps<S, A>) {
    const {children, context: contextOptional, store: storeOptional, ...spec} = props
    const contextDefault = StoreContext as React.Context<undefined | StoreManager<S, A>>
    const Context = contextOptional ?? contextDefault

    const contextValue = useMemo(() => {
        return storeOptional ?? createStore(spec)
    }, [storeOptional])

    return <Context.Provider value={contextValue} children={children}/>
}

export function useStoreContext<S extends ReducerState, A extends ReducerAction = ReducerAction>(
    options?: undefined | StoreContextOptions<S, A>,
): undefined | StoreManager<S, A> {
    const contextDefault = StoreContext as React.Context<undefined | StoreManager<S, A>>
    const contextValue = useContext(options?.context ?? contextDefault)

    return options?.store ?? contextValue
}

export function createStore<
    S extends ReducerState,
    A extends ReducerAction,
>(options: StoreDefinitionV2<S, A>): StoreManager<S, A> {
    const {createState, reduce, onDispatch} = options

    const state = createReactiveAccessor(createState())

    function dispatch(...polymorphicArgs: ReducerPolymorphicAction): S {
        const [id, ...args] = actionFromPolymorphicArgs(...polymorphicArgs)

        const oldState = state.read()
        const newState = reduce(oldState, ...[id, ...args] as A)

        onDispatch?.(id, args, newState, oldState)

        state.write(newState)

        return newState
    }

    return [state, dispatch]
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends ReducerState, A extends ReducerAction> extends
    StoreDefinitionV2<S, A>,
    StoreContextOptions<S, A>
{
    children: undefined | React.ReactNode
}

export type StoreManager<
    S extends ReducerState = ReducerState,
    A extends ReducerAction = ReducerAction,
> = [ReactiveAccessor<S>, StoreDispatchV2<S, A>]

export interface StoreContextOptions<S extends ReducerState, A extends ReducerAction = ReducerAction> {
    store?: undefined | StoreManager<S, A>
    context?: undefined | React.Context<undefined | StoreManager<S, A>>
}

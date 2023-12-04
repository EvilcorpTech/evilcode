import {createReactiveAccessor, type ReactiveAccessor} from '@eviljs/std/reactive-accessor.js'
import type {ReducerAction} from '@eviljs/std/redux.js'
import {isArray} from '@eviljs/std/type.js'
import {useCallback, useMemo} from 'react'
import {defineContext} from './ctx.js'
import type {StoreStateGeneric} from './store-v1.js'
import type {StoreDefinition, StoreDispatch, StoreDispatchPolymorphicArgs} from './store-v2.js'

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
export function StoreProvider<S extends StoreStateGeneric, A extends ReducerAction>(props: StoreProviderProps<S, A>) {
    const {children, context: contextOptional, ...spec} = props
    const contextDefault = StoreContext as React.Context<undefined | StoreManager<S, A>>
    const Context = contextOptional ?? contextDefault
    const contextValue = useStoreCreator(spec)

    return <Context.Provider value={contextValue} children={children}/>
}

export function useStoreCreator<
    S extends StoreStateGeneric,
    A extends ReducerAction,
>(spec: StoreDefinition<S, A>): StoreManager<S, A> {
    const {createState, reduce, onDispatch} = spec

    const state = useMemo(() => {
        return createReactiveAccessor(createState())
    }, [])

    const dispatch = useCallback((...polymorphicArgs: StoreDispatchPolymorphicArgs): S => {
        const [id, ...args] = (() => {
            const [idOrAction] = polymorphicArgs

            if (isArray(idOrAction)) {
                const [id, ...args] = idOrAction
                return [id, ...args] as ReducerAction
            }

            return polymorphicArgs as ReducerAction
        })()

        const oldState = state.read()
        const newState = reduce(oldState, ...[id, ...args] as A)

        onDispatch?.(id, args, newState, oldState)

        state.write(newState)

        return newState
    }, [reduce, onDispatch])

    const store = useMemo((): StoreManager<S, A> => {
        return [state, dispatch]
    }, [state, dispatch])

    return store
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends StoreStateGeneric, A extends ReducerAction> extends StoreDefinition<S, A> {
    children: undefined | React.ReactNode
    context?: undefined | React.Context<undefined | StoreManager<S, A>>
}

export type StoreManager<
    S extends StoreStateGeneric = StoreStateGeneric,
    A extends ReducerAction = ReducerAction,
> = [ReactiveAccessor<S>, StoreDispatch<S, A>]

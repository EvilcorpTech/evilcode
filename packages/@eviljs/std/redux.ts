import {compute} from './fn-compute.js'
import type {Fn, FnArgs} from './fn-type.js'
import {areObjectsEqualShallow} from './object.js'
import {isArray, type ValueOf} from './type.js'

export let ReducerUid = 0

export const ReduxActions = {
    listReducers<S extends ReduxReducerState>(
        actionsDefinitions: ReduxActionsDefinitions<S>,
    ): Array<[ReduxReducerId, ReduxActionReducer<S>]> {
        return Object.values(actionsDefinitions).map((it): [ReduxReducerId, ReduxActionReducer<S>] =>
            [it.id, it.reducer]
        )
    },

    objectFrom<D extends ReduxActionsDefinitions<any, ReduxReducerId, Array<any>>>(
        actionsDefinitions: D,
    ): {[key in keyof D]: D[key]['action']} {
        return Object.fromEntries(
            Object.entries(actionsDefinitions).map(([name, definition]): [string, Fn<FnArgs, [ReduxReducerId, ...FnArgs]>] =>
                [name, definition.action]
            )
        ) as any
    },
}

export const ReduxReducer = {
    fromActions<S extends ReduxReducerState>(
        actionsDefinitions: ReduxActionsDefinitions<S, ReduxReducerId, Array<any>>,
    ): ReduxCompositeReducerOfEntries<[ReduxReducerId, ReduxActionReducer<S, FnArgs>][]> {
        return ReduxReducer.fromReducers(ReduxActions.listReducers(actionsDefinitions))
    },

    fromReducers<T extends Array<[ReduxReducerId, ReduxActionReducer<any, any>]>>(
        reducersList: T,
    ): ReduxCompositeReducerOfEntries<T> {
        function reduce(state: ReduxReducerState, actionId: ReduxReducerId, ...args: ReduxReducerArgs): ReduxReducerState {
            for (const it of reducersList) {
                const [reducerId, reducer] = it

                if (reducerId !== actionId) {
                    continue
                }

                return reducer(state, ...args)
            }

            return state
        }

        return reduce as unknown as ReduxCompositeReducerOfEntries<T>
    },
}

export function withId(name: string) {
    return `#${++ReducerUid} ${name}`
}

export function defineReduxAction<S extends ReduxReducerState, K extends ReduxReducerId, A extends ReduxReducerArgs>(
    id: K,
    reducer: (state: S, ...args: A) => S,
): ReduxActionDefinition<S, K, A>
{
    return {
        id,
        action(...args: A) {
            return [id, ...args]
        },
        reducer,
    }
}

export function patchState<S extends ReduxReducerState>(state: S, statePatch: ReduxStatePatch<S>): S {
    const nextState = compute(statePatch, state)
    const mergedState = {...state, ...nextState}

    return areObjectsEqualShallow(state, mergedState)
        ? state
        : mergedState
}

export function asReduxEvent(...args: ReduxEventPolymorphic): ReduxEvent {
    return isArray(args[0])
        ? args[0] as ReduxEvent // args is: [[id, ...args]]
        : args as ReduxEvent // args is: [id, ...args]
}

// Types ///////////////////////////////////////////////////////////////////////

export type ReduxReducerState = object
export type ReduxReducerId = number | string
export type ReduxReducerArgs = FnArgs

export type ReduxEvent<
    K extends ReduxReducerId = ReduxReducerId,
    A extends ReduxReducerArgs = ReduxReducerArgs,
> = [id: K, ...args: A]

export type ReduxEventPolymorphic = ReduxEvent | [ReduxEvent]

export interface ReduxRootReducer<
    S extends ReduxReducerState = ReduxReducerState,
    K extends ReduxReducerId = ReduxReducerId,
    A extends ReduxReducerArgs = ReduxReducerArgs,
> {
    (state: S, id: K, ...args: A): S
}

export interface ReduxActionReducer<
    S extends ReduxReducerState = ReduxReducerState,
    A extends ReduxReducerArgs = ReduxReducerArgs,
> {
    (state: S, ...args: A): S
}

export type ReduxActionsDefinitions<
    S extends ReduxReducerState = ReduxReducerState,
    K extends ReduxReducerId = ReduxReducerId,
    A extends ReduxReducerArgs = ReduxReducerArgs,
> = Record<PropertyKey, ReduxActionDefinition<S, K, A>>

export interface ReduxActionDefinition<
    S extends ReduxReducerState = ReduxReducerState,
    K extends ReduxReducerId = ReduxReducerId,
    A extends ReduxReducerArgs = ReduxReducerArgs,
> {
    id: K
    action(...args: A): ReduxEvent<K, A>
    reducer: ReduxActionReducer<S, A>
}

export type ReduxCompositeReducerOfEntries<L extends Array<[ReduxReducerId, ReduxActionReducer<any, Array<any>>]>> =
    (...args: ReduxGlobalReducerArgsOfEntries<L>) => ReduxReducerStateOfEntries<L>

export type ReduxReducerStateOfEntries<L extends Array<[ReduxReducerId, ReduxActionReducer<any, Array<any>>]>> =
    L extends Array<[ReduxReducerId, ReduxActionReducer<infer S, ReduxReducerArgs>]>
        ? S
        : ReduxReducerState

export type ReduxGlobalReducerArgsOfEntries<L extends Array<[ReduxReducerId, ReduxActionReducer<any, Array<any>>]>> =
    { [key in keyof L]: ReduxGlobalReducerArgsOfEntry<L[key]> }[number]

export type ReduxGlobalReducerArgsOfEntry<I extends [ReduxReducerId, ReduxActionReducer]> =
    I extends [infer K, ReduxActionReducer<infer S, infer A>]
        ? [S, K, ...A]
        : [ReduxReducerState, ReduxReducerId, ...FnArgs]

export type ReduxEventOfGlobalReducer<R extends ((state: any, ...args: Array<any>) => ReduxReducerState)> =
    R extends ((state: ReduxReducerState, ...args: infer A) => ReduxReducerState)
        ? A
        : [ReduxReducerId, ...ReduxReducerArgs]

export type ReduxEventsOfActions<D extends Record<PropertyKey, ReduxActionDefinition<any, ReduxReducerId, Array<any>>>> =
    ReturnType<ValueOf<D>['action']>

export type ReduxStatePatch<S extends ReduxReducerState> = Partial<S> | ((prevState: S) => Partial<S>)

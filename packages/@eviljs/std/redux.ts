import {compute} from './compute.js'
import type {FnArgs} from './fn.js'
import {areObjectsEqualShallow} from './object.js'
import {isArray, type ValueOf} from './type.js'

export let ReducerUid = 0

export function withId(name: string) {
    return `#${++ReducerUid} ${name}`
}

export function defineReducerAction<S extends ReducerState, K extends ReducerId, A extends ReducerArgs>(
    id: K,
    reducer: (state: S, ...args: A) => S,
): ReducerActionDefinition<S, K, A>
{
    return {
        id,
        action(...args: A) {
            return [id, ...args]
        },
        reducer,
    }
}

export function composeReducersEntries<
    T extends Array<[ReducerId, ReducerTarget<any, any>]>,
>(reducers: T): CompositeReducerOfEntries<T> {
    function reduce(state: ReducerState, actionId: ReducerId, ...args: ReducerArgs): ReducerState {
        for (const it of reducers) {
            const [reducerId, reducer] = it

            if (reducerId !== actionId) {
                continue
            }

            return reducer(state, ...args)
        }

        return state
    }

    return reduce as unknown as CompositeReducerOfEntries<T>
}

export function reducersEntriesFromActions<S extends ReducerState>(
    actions: Record<
        PropertyKey,
        ReducerActionDefinition<S, ReducerId, Array<any>>
    >,
): Array<[ReducerId, ReducerTarget<S>]> {
    return Object.values(actions).map((it): [ReducerId, ReducerTarget<S>] => [it.id, it.reducer])
}

export function patchState<S extends ReducerState>(state: S, statePatch: StoreStatePatch<S>): S {
    const nextState = compute(statePatch, state)
    const mergedState = {...state, ...nextState}

    return areObjectsEqualShallow(state, mergedState)
        ? state
        : mergedState
}

export function actionFromPolymorphicArgs(...args: ReducerPolymorphicAction): ReducerAction {
    return isArray(args[0])
        ? args[0] as ReducerAction // args is: [[id, ...args]]
        : args as ReducerAction // args is: [id, ...args]
}

// Types ///////////////////////////////////////////////////////////////////////

export type ReducerState = object
export type ReducerId = number | string
export type ReducerArgs = FnArgs

export interface ReducerActionDefinition<
    S extends ReducerState = ReducerState,
    K extends ReducerId = ReducerId,
    A extends ReducerArgs = ReducerArgs,
> {
    id: K
    action(...args: A): ReducerAction<K, A>
    reducer: ReducerTarget<S, A>
}

export type ReducerAction<
    K extends ReducerId = ReducerId,
    A extends ReducerArgs = ReducerArgs,
> = [id: K, ...args: A]

export type ReducerPolymorphicAction = ReducerAction | [ReducerAction]

export interface Reducer<
    S extends ReducerState = ReducerState,
    K extends ReducerId = ReducerId,
    A extends ReducerArgs = ReducerArgs,
> {
    (state: S, id: K, ...args: A): S
}

export interface ReducerTarget<
    S extends ReducerState = ReducerState,
    A extends ReducerArgs = ReducerArgs,
> {
    (state: S, ...args: A): S
}

export type CompositeReducerOfEntries<L extends Array<[ReducerId, ReducerTarget<any, Array<any>>]>> =
    (...args: ReducerArgsOfEntries<L>) => ReducerStateOfEntries<L>

export type ReducerStateOfEntries<L extends Array<[ReducerId, ReducerTarget<any, Array<any>>]>> =
    L extends Array<[ReducerId, ReducerTarget<infer S, ReducerArgs>]>
        ? S
        : ReducerState

export type ReducerArgsOfEntries<L extends Array<[ReducerId, ReducerTarget<any, Array<any>>]>> =
    { [key in keyof L]: ReducerArgsOfEntry<L[key]> }[number]

export type ReducerArgsOfEntry<I extends [ReducerId, ReducerTarget]> =
    I extends [infer K, ReducerTarget<infer S, infer A>]
        ? [S, K, ...A]
        : [ReducerState, ReducerId, ...FnArgs]

export type ReducerActionOf<R extends ((state: any, ...args: Array<any>) => ReducerState)> =
    R extends ((state: ReducerState, ...args: infer A) => ReducerState)
        ? A
        : [ReducerId, ...ReducerArgs]

export type ReducerActionOfDict<D extends Record<PropertyKey, ReducerActionDefinition<any, ReducerId, Array<any>>>> =
    ReturnType<ValueOf<D>['action']>

export type StoreStatePatch<S extends ReducerState> = Partial<S> | ((prevState: S) => Partial<S>)

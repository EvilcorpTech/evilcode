import type {FnArgs} from './fn.js'
import {computeValue} from './fn.js'
import {areObjectsEqualShallow} from './object.js'
import type {ValueOf} from './type.js'

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

export function composeReducers<
    T extends Array<[ReducerId, ReducerTarget<any, any>]>,
>(...reducers: T): CompositeReducerOfList<T> {
    function reducerComposite(state: ReducerState, id: ReducerId, ...args: ReducerArgs): ReducerState {
        for (const it of reducers) {
            const [reducerId, reducer] = it

            if (reducerId !== id) {
                continue
            }

            return reducer(state, ...args)
        }

        return state
    }

    return reducerComposite as unknown as CompositeReducerOfList<T>
}

export function fromActionsDefinitions<S extends ReducerState>(
    actionsSpec: Record<
        PropertyKey,
        ReducerActionDefinition<S, ReducerId, Array<any>>
    >,
): Array<[ReducerId, ReducerTarget<S, ReducerArgs>]> {
    return Object.values(actionsSpec).map(it => [
        it.id,
        it.reducer,
    ] as [ReducerId, ReducerTarget<S>])
}

export function patchState<S extends ReducerState>(state: S, statePatch: StoreStatePatch<S>): S {
    const nextState = computeValue(statePatch, state)
    const mergedState = {...state, ...nextState}

    return areObjectsEqualShallow(state, mergedState)
        ? state
        : mergedState
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

export type CompositeReducerOfList<L extends Array<[ReducerId, ReducerTarget<any, Array<any>>]>> =
    (...args: ReducerArgsOfList<L>) => ReducerStateOfList<L>

export type ReducerStateOfList<L extends Array<[ReducerId, ReducerTarget<any, Array<any>>]>> =
    L extends Array<[ReducerId, ReducerTarget<infer S, ReducerArgs>]>
        ? S
        : ReducerState

export type ReducerArgsOfList<L extends Array<[ReducerId, ReducerTarget<any, Array<any>>]>> =
    { [key in keyof L]: ReducerArgsOfListItem<L[key]> }[number]

export type ReducerArgsOfListItem<I extends [ReducerId, ReducerTarget]> =
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

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
>(...reducers: T): CompositeReducerOf<T> {
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

    return reducerComposite as unknown as CompositeReducerOf<T>
}

// Types ///////////////////////////////////////////////////////////////////////

export type ReducerState = object
export type ReducerId = number | string
export type ReducerArgs = Array<unknown>

export interface ReducerActionDefinition<S extends ReducerState, K extends ReducerId, A extends ReducerArgs> {
    id: K
    action(...args: A): ReducerAction<K, A>
    reducer: ReducerTarget<S, A>
}

export type ReducerAction<K extends ReducerId = ReducerId, A extends ReducerArgs = ReducerArgs> = [id: K, ...args: A]

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

export type CompositeReducerOf<T extends Array<[ReducerId, ReducerTarget<ReducerState, ReducerArgs>]>> =
    (...args: ReducersArgsOf<T>) => ReducerStateOf<T>

export type ReducerStateOf<T extends Array<[ReducerId, ReducerTarget<ReducerState, ReducerArgs>]>> =
    T extends [ReducerId, ReducerTarget<infer S, ReducerArgs>]
        ? S
        : ReducerState

export type ReducersArgsOf<T extends Array<[ReducerId, ReducerTarget<ReducerState, ReducerArgs>]>> =
    {
        [key in keyof T]: ReducerArgsOf<T[key]>
    }[number]

export type ReducerArgsOf<T extends [ReducerId, ReducerTarget]> =
    T extends [infer K, ReducerTarget<infer S, infer A>]
        ? string extends K
            ? [ReducerState, ReducerId, ...Array<unknown>]
            : [S, K, ...A]
        : [ReducerState, ReducerId, ...Array<unknown>]

export type ReducerActionsOf<R extends ((state: any, ...args: any) => ReducerState)> =
    R extends ((state: ReducerState, ...args: infer A) => ReducerState)
        ? A
        : [ReducerId, ReducerArgs]

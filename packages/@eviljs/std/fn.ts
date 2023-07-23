// Types ///////////////////////////////////////////////////////////////////////

export type Fn<A extends FnArgs, R = void> = (...args: A) => R
export type FnArgs = Array<unknown>

export type Io<I = unknown, O = unknown> = Fn<[input: I], O>
export type IoAsync<I, O> = Io<I, Promise<O>>

export type Task<R = void> = Fn<[], R>
export type TaskAsync<R = void> = Task<Promise<R>>

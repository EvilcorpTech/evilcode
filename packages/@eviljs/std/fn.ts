// Types ///////////////////////////////////////////////////////////////////////

export type FnArgs = Array<unknown>

export type Task<R = void> = () => R
export type TaskVoid = Task<void>
export type AsyncTask<R = void> = Task<Promise<R>>

export type Fn<A extends FnArgs, R = void> = (...args: A) => R
export type Io<I = unknown, O = unknown> = (input: I) => O
export type AsyncIo<I, O> = Io<I, Promise<O>>

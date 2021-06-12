export function wrap
    <A extends Array<unknown>, R = unknown>
    (fn: (...args: A) => R, decorators: Array<Decorator>)
{
    const wrapped = decorators.reduce((fn, decorate) =>
        decorate(fn)
    , fn)

    return wrapped as Fn<A, R>
}

// Types ///////////////////////////////////////////////////////////////////////

export type Decorator = (fn: Fn) => Fn

export type Fn
    <A extends Array<any> = Array<any>, R = any>
    = (...args: A) => R

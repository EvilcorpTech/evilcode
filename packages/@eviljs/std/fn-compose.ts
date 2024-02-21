import type {Io} from './fn-type.js'

export function compose<I, O = I>(fn: Io<I, O>) {
    return createComposer<I, I, O>([], fn)
}

function createComposer<I, LastO>(stack: Array<Io>): Io<I, LastO>
function createComposer<I, LastO>(stack: Array<Io>, fn: undefined): Io<I, LastO>
function createComposer<I, LastO, CurrentO>(stack: Array<Io>, fn: Io<LastO, CurrentO>): Composition<I, CurrentO>
function createComposer<I, LastO, CurrentO>(stack: Array<Io>, fn?: undefined | Io<LastO, CurrentO>): Io<I, LastO> | Composition<I, CurrentO>
function createComposer<I, LastO, CurrentO>(stack: Array<Io>, fn?: Io<LastO, CurrentO>): Io<I, LastO> | Composition<I, CurrentO> {
    if (! fn) {
        function continuation(input: I): LastO {
            return computeComposition(stack, input) as LastO
        }

        return continuation
    }

    const nextStack = [...stack, fn as Io]

    function continuation<NextO>(nextFn?: Io<CurrentO, NextO>) {
        return createComposer<I, CurrentO, NextO>(nextStack, nextFn)
    }

    return continuation as Composition<I, CurrentO>
}

export function computeComposition<I>(stack: Array<Io<I, I>>, initialInput: I): I {
    return stack.reduce((input, fn) => fn(input), initialInput)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Composition<I, LastO> {
    (): Io<I, LastO>
    <CurrentO>(fn: Io<LastO, CurrentO>): Composition<I, CurrentO>
}

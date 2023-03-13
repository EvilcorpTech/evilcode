import type {Io} from './fn.js'

export function compose<I, O = I>(fn: Io<I, O>) {
    return createComposer<I, I, O>([], fn)
}

function createComposer<InitialInput, LastOutput>(stack: Array<Io>): Io<InitialInput, LastOutput>
function createComposer<InitialInput, LastOutput>(stack: Array<Io>, fn: undefined): Io<InitialInput, LastOutput>
function createComposer<InitialInput, LastOutput, CurrentOutput>(stack: Array<Io>, fn: Io<LastOutput, CurrentOutput>): Composition<InitialInput, CurrentOutput>
function createComposer<InitialInput, LastOutput, CurrentOutput>(stack: Array<Io>, fn?: undefined | Io<LastOutput, CurrentOutput>): Io<InitialInput, LastOutput> | Composition<InitialInput, CurrentOutput>
function createComposer<InitialInput, LastOutput, CurrentOutput>(stack: Array<Io>, fn?: Io<LastOutput, CurrentOutput>): Io<InitialInput, LastOutput> | Composition<InitialInput, CurrentOutput> {
    if (! fn) {
        function continuation(input: InitialInput): LastOutput {
            return computeComposition(stack, input) as LastOutput
        }

        return continuation
    }

    const nextStack = [...stack, fn as Io]

    function continuation<NextOutput>(nextFn?: Io<CurrentOutput, NextOutput>) {
        return createComposer<InitialInput, CurrentOutput, NextOutput>(nextStack, nextFn)
    }

    return continuation as Composition<InitialInput, CurrentOutput>
}

export function computeComposition<I>(stack: Array<Io<I, I>>, initialInput: I): I {
    return stack.reduce((input, fn) => fn(input), initialInput)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Composition<InitialInput, LastOutput> {
    (): Io<InitialInput, LastOutput>
    <CurrentOutput>(fn: Io<LastOutput, CurrentOutput>): Composition<InitialInput, CurrentOutput>
}

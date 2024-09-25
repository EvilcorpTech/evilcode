import {piping} from './fn-pipe.js'

export function defineMachine<S, E, P extends object = {}>(
    args: MachineDefinitionOptions<S, E> & P,
): MachineDefinition<S, E> & Omit<P, keyof MachineDefinitionOptions<S, E>> {
    const {createState, effect, pipeline, reduce, ...otherProps} = args

    function reduceMachine(oldState: S, event: E) {
        return piping(oldState)
            (newState => reduce(newState, event))
            (newState => pipeline?.reduce((state, transform) => transform(state, oldState, event), newState) ?? newState)
            (newState => (effect?.(newState, oldState, event), newState))
        ()
    }

    return {...otherProps as P, createState, reduce: reduceMachine}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MachineDefinitionOptions<S, E> {
    createState(): S
    reduce(state: S, event: E): S
    pipeline?: undefined | Array<MachinePipelineTransformer<S, E>>
    effect?: undefined | MachineLogger<S, E>
}

export interface MachineDefinition<S, E> {
    createState(): S
    reduce(state: S, event: E): S
}

export interface MachinePipelineTransformer<S, E> {
    (newState: S, oldState: S, event: E): S
}

export interface MachineLogger<S, E> {
    (newState: S, oldState: S, event: E): void
}

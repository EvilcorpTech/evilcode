import {useRef, useState} from 'react'

export function useMachine<S, E>(reduce: Machine<S, E>, init: MachineInitState<S>) {
    const [state, setState] = useState<S>(init)

    function dispatch(event: E) {
        setState(prevState =>
            reduce(prevState, event)
        )
    }

    return [state, dispatch] as const
}

export function useMachineRef<S, E>(reduce: Machine<S, E>, init: MachineInitState<S>) {
    const [initState] = useState(init)
    const stateRef = useRef<S>(initState)

    function dispatch(event: E) {
        stateRef.current = reduce(stateRef.current, event)
    }

    return [stateRef, dispatch] as const
}

// Types ///////////////////////////////////////////////////////////////////////

export type Machine<S, E> = (state: S, event: E) => S
export type MachineInitState<S> = S | (() => S)

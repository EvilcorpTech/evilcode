import {useMemo, useRef, useState} from 'react'

export function useMachine<S extends {}, E>(run: Machine<S, E>, init: MachineInitState<S>) {
    const [state, setState] = useState<S>(init)

    function commit(event: E) {
        setState(prevState =>
            run(prevState, event)
        )
    }

    return [state, commit] as const
}

export function useMachineRef<S extends {}, E>(run: Machine<S, E>, init: MachineInitState<S>) {
    const initState = useMemo(init, [init])
    const stateRef = useRef<S>(initState)

    function commit(event: E) {
        stateRef.current = run(stateRef.current, event)
    }

    return [stateRef, commit] as const
}

// Types ///////////////////////////////////////////////////////////////////////

export type Machine<S extends {}, E> = (state: S, event: E) => S
export type MachineInitState<S extends {}> = (() => S)

import type {Task, Io} from '@eviljs/std/fn-type.js'
import {useCallback, useRef, useState} from 'react'

export function useMachine<S, E>(reduce: MachineReducer<S, E>, createState: MachineInitState<S>): MachineManager<S, E> {
    const [state, setState] = useState(createState)
    const stateRef = useRef(state)

    const dispatch: MachineDispatch<S, E> = useCallback((event: E) => {
        stateRef.current = reduce(stateRef.current, event)
        setState(stateRef.current)

        return stateRef.current
    }, [])

    const readState = useCallback(() => {
        return stateRef.current
    }, [])

    return [state, dispatch, readState]
}

// Types ///////////////////////////////////////////////////////////////////////

export type MachineManager<S, E> = [state: S, dispatch: MachineDispatch<S, E>, readState: Task<S>]
export type MachineDispatch<S, E> = Io<E, S>
export type MachineReducer<S, E> = (state: S, event: E) => S
export type MachineInitState<S> = S | (() => S)

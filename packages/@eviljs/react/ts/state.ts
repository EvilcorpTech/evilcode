import {compute} from '@eviljs/std/fn-compute'
import type {Io} from '@eviljs/std/fn-type'
import {startTransition, useCallback, useRef, useState} from 'react'

export function useStateAccessor<S>(initialState: StateInit<S>): StateAccessorManager<S> {
    const [state, PRIVATE_setState] = useState(initialState)
    const stateRef = useRef(state)

    const getState = useCallback((): S => {
        return stateRef.current
    }, [])

    const setState = useCallback((stateComputed: StateSetterArg<S>): S => {
        const state = compute(stateComputed, stateRef.current)

        stateRef.current = state

        PRIVATE_setState(state)

        return state
    }, [])

    return [state, setState, getState]
}

export function useStateTransition<S>(initialState: StateInit<S>): StateAccessorManager<S> {
    const [state, PRIVATE_setState] = useState(initialState)
    const stateRef = useRef(state)

    const getState = useCallback((): S => {
        return stateRef.current
    }, [])

    const setState = useCallback((stateComputed: StateSetterArg<S>): S => {
        const state = compute(stateComputed, stateRef.current)

        stateRef.current = state

        startTransition(() => {
            PRIVATE_setState(state)
        })

        return state
    }, [])

    return [state, setState, getState]
}

/*
* Used to shallow merge a state object with a change.
*
* EXAMPLE
*
* function MyComponent(props) {
*     const [state, setState] = useState({checked: false, input: ''})
*     const patchState = useMergeState(setState)
*
*     return (
*         <Input onChange={input => patchState({input})}/>
*     )
* }
*/
export function useMergeState<S extends object>(setState: StateSetter<S>): Io<Partial<S>, void> {
    const patchState = useCallback((statePatch: Partial<S>) => {
        setState(mergingState(statePatch))
    }, [setState])

    return patchState
}

/*
* Used to shallow merge a state object with a change.
*
* EXAMPLE
*
* function MyComponent(props) {
*     const [state, setState] = useState({checked: false, input: ''})
*
*     return (
*         <Input onChange={input => setState(merging({input}))}/>
*     )
* }
*/
export function mergingState<S extends object>(statePatch: Partial<S>): Io<S, S> {
    function mergeState(state: S): S {
        return {...state, ...statePatch}
    }

    return mergeState
}

// Types ///////////////////////////////////////////////////////////////////////

export type StateInit<S> = S | (() => S)
export type StateSetter<S> = React.Dispatch<StateSetterArg<S>>
export type StateSetterArg<S> = React.SetStateAction<S>
export type StatePatcher<S extends object> = (statePatch: Partial<S>) => void
export type StateManager<S> = [S, StateSetter<S>]

export type StateAccessorWriter<S> = (state: StateSetterArg<S>) => S
export type StateAccessorManager<S> = [S, StateAccessorWriter<S>, () => S]

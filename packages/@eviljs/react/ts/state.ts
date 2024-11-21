import {compute} from '@eviljs/std/fn-compute'
import type {Io} from '@eviljs/std/fn-type'
import {useCallback, useRef, useState} from 'react'

export function useStateStore<S>(initialState: StateInit<S>): StateStoreManager<S> {
    const [state, setState] = useState(initialState)
    const stateRef = useRef(state)

    const getState = useCallback((): S => {
        return stateRef.current
    }, [])

    const setStateStore = useCallback((stateComputed: StateSetterArg<S>): S => {
        const state = compute(stateComputed, stateRef.current)
        stateRef.current = state
        setState(state)
        return state
    }, [])


    return [state, setStateStore, getState]
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

export type StateStoreSetter<S> = (state: StateSetterArg<S>) => S
export type StateStoreManager<S> = [S, StateStoreSetter<S>, () => S]

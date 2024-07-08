import type {Io} from '@eviljs/std/fn-type.js'
import {useCallback} from 'react'

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

export type StateInit<T> = T | (() => T)
export type StateSetter<T> = React.Dispatch<StateSetterArg<T>>
export type StateSetterArg<T> = React.SetStateAction<T>
export type StatePatcher<S extends object> = (statePatch: Partial<S>) => void
export type StateManager<T> = [T, StateSetter<T>]

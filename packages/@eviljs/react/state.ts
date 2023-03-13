import {useCallback, useState} from 'react'

/*
* Used to shallow merge a state object with a change.
*
* EXAMPLE
*
* function MyComponent(props) {
*     const [state, setState, patchState] = useStateObject({checked: false, input: ''})
*
*     return (
*         <Input onChange={input => patchState({input})}/>
*     )
* }
*/
export function useStateObject<S extends object>(initialState: StateInit<S>): [...StateManager<S>, StatePatcher<S>] {
    const [state, setState] = useState(initialState)
    const patchState = useMergeState(setState)

    return [state, setState, patchState]
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
export function useMergeState<S extends object>(setState: StateSetter<S>) {
    const patchState = useCallback((statePatch: Partial<S>) => {
        setState(merging(statePatch))
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
export function merging<S extends object>(statePatch: Partial<S>) {
    function setState(state: S) {
        return {...state, ...statePatch}
    }

    return setState
}

// Types ///////////////////////////////////////////////////////////////////////

export type StateInit<T> = T | (() => T)
export type StateSetter<T> = React.Dispatch<StateSetterArg<T>>
export type StateSetterArg<T> = React.SetStateAction<T>
export type StatePatcher<S extends object> = (statePatch: Partial<S>) => void
export type StateManager<T> = [T, StateSetter<T>]

import {compute} from '@eviljs/std/fn-compute'
import {createHistory} from '@eviljs/std/undoredo'
import {useCallback, useMemo} from 'react'
import {useRender} from './render.js'
import type {StateSetterArg} from './state.js'

export function useUndoRedo<S>(initState: S | (() => S)): UndoRedoManager<S> {
    const render = useRender()

    function withRenderEffect<A extends Array<unknown>>(fn: (...args: A) => S) {
        function proxy(...args: A) {
            const previousState = history.state
            const currentState = fn(...args)

            if (currentState !== previousState) {
                render()
            }

            return currentState
        }

        return proxy
    }

    const history = useMemo(() => {
        return createHistory(compute(initState))
    }, [])

    const onUndo = useCallback(withRenderEffect(history.undo), [history])
    const onRedo = useCallback(withRenderEffect(history.redo), [history])

    const onSave = useCallback(withRenderEffect((state: StateSetterArg<S>) => {
        const prevState = history.state
        const nextState = compute(state, prevState)
        return history.save(nextState)
    }), [history])

    const {state, redoStack, undoStack} = history

    return {state, redoStack, undoStack, onUndo, onRedo, onSave}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface UndoRedoManager<S> {
    state: S
    redoStack: Array<S>
    undoStack: Array<S>
    onUndo(): S
    onRedo(): S
    onSave(state: StateSetterArg<S>): S
}

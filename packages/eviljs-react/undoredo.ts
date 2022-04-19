import {computeValue} from '@eviljs/std/fn.js'
import {createHistory} from '@eviljs/std/undoredo.js'
import {useCallback, useMemo, useState} from 'react'

export function useUndoRedo<S>(initState: S) {
    const [state, setState] = useState(initState)

    const history = useMemo(() => {
        return createHistory(initState)
    }, [])

    const onUndo = useCallback(() => {
        setState(history.undo())
    }, [history])

    const onRedo = useCallback(() => {
        setState(history.redo())
    }, [history])

    const onSave = useCallback((nextState: React.SetStateAction<S>) => {
        const computedState = computeValue(nextState, state)
        history.save(computedState)
        setState(computedState)
    }, [history, state])

    const {redoStack, undoStack} = history

    return {state, redoStack, undoStack, onUndo, onRedo, onSave}
}

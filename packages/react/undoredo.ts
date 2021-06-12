import {createHistory} from '@eviljs/std/undoredo.js'
import React from 'react'
const {useCallback, useMemo, useState} = React

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

    const onSave = useCallback((state: S) => {
        setState(history.save(state))
    }, [history])

    const {redoStack, undoStack} = history

    return {state, redoStack, undoStack, onUndo, onRedo, onSave}
}

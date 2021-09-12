export function createHistory<S>(state: S) {
    const self: History<S> = {
        undoStack: [],
        state,
        redoStack: [],
        save(state: S) {
            return save(self, state)
        },
        undo() {
            return undo(self)
        },
        redo() {
            return redo(self)
        },
    }

    return self
}

export function save<S>(history: History<S>, state: S) {
    if (history.state === state) {
        // This is a recoil notification:
        // a mutation wants to change the state with a value identical to the one
        // already in the history. Prevented.
        return history.state
    }

    history.undoStack.push(history.state) // 1.
    history.redoStack = [] // 2. A saving resets the redo stack.
    history.state = state // 3.

    return history.state
}

export function undo<S>(history: History<S>) {
    const nextState = history.undoStack.pop()

    if (! nextState) {
        // We have nothing to restore.
        return history.state
    }

    history.redoStack.push(history.state) // 1.
    history.state = nextState // 2.

    return history.state
}

export function redo<S>(history: History<S>) {
    const nextState = history.redoStack.pop()

    if (! nextState) {
        // We have nothing to restore.
        return history.state
    }

    history.undoStack.push(history.state) // 1.
    history.state = nextState // 2.

    return history.state
}

// Types ///////////////////////////////////////////////////////////////////////

export interface History<S> {
    state: S
    undoStack: Array<S>
    redoStack: Array<S>
    save(state: S): S
    undo(): S
    redo(): S
}

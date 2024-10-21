import '@eviljs/reactx/input-v1/input-theme.css'
import '@eviljs/reactx/input-v1/input.css'

import {useUndoRedo} from '@eviljs/react/undoredo'
import {Button} from '@eviljs/reactx/button-v1/button.js'
import {Input} from '@eviljs/reactx/input-v1/input.js'
import {defineShowcase} from '@eviljs/reactx/showcase-v1/showcase.js'

export default defineShowcase('Undo Redo', (props) => {
    const history = useUndoRedo({message: ''})

    return (
        <div>
            <Button
                disabled={history.undoStack.length === 0}
                onClick={history.onUndo}
            >
                Undo
            </Button>
            <Button
                disabled={history.redoStack.length === 0}
                onClick={history.onRedo}
            >
                Redo
            </Button>
            <Input
                value={history.state.message}
                onChange={(value) => history.onSave({message: value})}
            />
        </div>
    )
})

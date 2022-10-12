import {useUndoRedo} from '@eviljs/react/undoredo'
import {Button} from '@eviljs/reactx/button'
import {Input} from '@eviljs/reactx/input/floating'
import {defineShowcase} from '@eviljs/reactx/showcase'

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

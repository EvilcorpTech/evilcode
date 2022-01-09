import {classes} from '@eviljs/react/react'
import {useUndoRedo} from '@eviljs/react/undoredo'
import {Button} from '@eviljs/reactx/button'
import {Input} from '@eviljs/reactx/input/floating'
import {HtmlSandbox} from '@eviljs/webx/html-sandbox'
import {createElement, useState} from 'react'
import {useI18nMsg} from 'lib/hooks/i18n'
import {State, useStore} from 'lib/hooks/store'
import {Header} from 'lib/widgets/header'

import './lab-view.css'

if (! customElements.get('html-sandbox')) { // HMR Compatibility.
    customElements.define('html-sandbox', HtmlSandbox)
}

export function LabView(props: LabViewProps) {
    const {className, ...otherProps} = props
    const [text, setText] = useState('<b>Hello<b/>')
    const [color, setColor] = useState('red')
    const [theme, setTheme] = useStore((state: State) => state.theme)

    const history = useUndoRedo({message: ''})

    const msg = useI18nMsg(({ t }) => {
        return {
            title: t`Lab`,
        }
    })

    return (
        <div
            {...otherProps}
            className={classes('LabView-54e6 std std-theme-light', className)}
        >
            <Header/>

            <h1 className="page-title">
                {msg.title}
            </h1>

            <main className="std-stack v">
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

                <i className="std-space-v gap6"/>

                <div>
                    <h6>Html Sandbox</h6>
                    <div><input value={text} onChange={event => setText(event.target.value)}/></div>
                    <div><input value={color} onChange={event => setColor(event.target.value)}/></div>

                    {createElement('html-sandbox', {
                        style: {'--color': color},
                    }, [`
                        <style>
                            p { color: var(--color); }
                        </style>

                        <p>${text}</p>
                    `])}
                </div>
            </main>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LabViewProps extends React.HTMLAttributes<HTMLDivElement> {
}

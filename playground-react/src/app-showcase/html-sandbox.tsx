import {HtmlSandbox, defineHtmlSandbox} from '@eviljs/reactx/html-sandbox-v1/html-sandbox'
import {defineShowcase} from '@eviljs/reactx/showcase-v1/showcase'
import {useState} from 'react'

defineHtmlSandbox()

export default defineShowcase('Html Sandbox', (props) => {
    const [text, setText] = useState('<b>Hello <i>World</i><b/>')
    const [color, setColor] = useState('red')

    return (
        <div>
            <div><input value={text} onChange={event => setText(event.target.value)}/></div>
            <div><input value={color} onChange={event => setColor(event.target.value)}/></div>

            <HtmlSandbox
                style={{'--color': color} as React.CSSProperties}
            >
                {`
                    <style>
                        p { color: var(--color); }
                    </style>

                    <p>${text}</p>
                `}
            </HtmlSandbox>
        </div>
    )
})

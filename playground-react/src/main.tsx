import {createContainer} from '@eviljs/std/container'
import {createRoot} from 'react-dom/client'
import {ContainerSpec} from './container'
import * as Context from './context'
import {Root, RootContext} from './root'

import '~/styles.css'

console.table({...Context})

const container = createContainer(ContainerSpec)
const rootElement = attachRootElement()
const root = createRoot(rootElement)

root.render(
    <RootContext container={container}>
        <Root/>
    </RootContext>
)

function attachRootElement(): Element {
    const existingRootElement = Array.from(document.body.children).find(it =>
        it.classList.contains('Root')
    )

    if (existingRootElement) {
        return existingRootElement
    }

    const rootElement = document.createElement('div')
    rootElement.classList.add('Root')
    document.body.prepend(rootElement)
    return rootElement
}

import '~/style/index.css'

import {createContainer} from '@eviljs/std/container'
import {createRoot} from 'react-dom/client'
import {ContainerSpec} from '~/container/apis'
import * as Env from '~/env/apis'
import {App, Root} from '~/root/root'

console.table({...Env})

const container = createContainer(ContainerSpec)
const rootElement = attachRootElement()
const root = createRoot(rootElement)

root.render(
    <Root container={container}>
        <App/>
    </Root>
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

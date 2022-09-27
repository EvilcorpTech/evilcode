if (__WITH_PREACT__ === true && __MODE__ !== 'production') {
    require('preact/debug')
}

import {createContainer} from '@eviljs/std/container'
import {createRoot, Root as AppRoot} from 'react-dom/client'
import {ContainerSpec} from './container'
import * as Context from './context'
import {Root, RootContext} from './root'

import './style.css'

console.table({...Context})

const container = createContainer(ContainerSpec)
const rootElement = createRootElement()
const appRoot = rootElement.appRoot ?? createRoot(rootElement)

rootElement.appRoot = appRoot
appRoot.render(
    <RootContext container={container}>
        <Root/>
    </RootContext>
)

function createRootElement(): Element & {appRoot?: AppRoot} {
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

// Hot Module Replacement (development mode).
if (module.hot) {
    module.hot.accept()
}

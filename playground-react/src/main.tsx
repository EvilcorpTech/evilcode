import {createContainer} from '@eviljs/std/container'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {App} from './app/app'
import {ContainerSpec} from './lib/container'
import * as Context from './lib/context'

import './lib/style.css'

console.table({...Context})

const container = createContainer(ContainerSpec)
const rootElement = document.getElementById('App') ?? document.body
const root = createRoot(rootElement)

root.render(
    <StrictMode>
        <App container={container}/>
    </StrictMode>
)

import {createContainer} from '@eviljs/std/container'
import {StrictMode} from 'react'
import {render} from 'react-dom'
import {App} from './app/app'
import {ContainerSpec} from './lib/container'
import * as Context from './lib/context'

import './lib/theme.css'

console.table({...Context})

const container = createContainer(ContainerSpec)
const rootElement = document.getElementById('App') ?? document.body

render(
    <StrictMode>
        <App container={container}/>
    </StrictMode>
, rootElement)

// Hot Module Replacement (development mode) ///////////////////////////////////
// BEGIN
declare const module: {hot: {accept(): void}}
if (module.hot) {
    module.hot.accept()
}
// END

import {createContainer} from '@eviljs/std/container'
import {createElement} from 'react'
import {render} from 'react-dom'
import {App} from './app/app'
import {ContainerSpec} from './lib/container'
import * as Context from './lib/context'

import './lib/theme.css'

console.table({...Context})

const container = createContainer(ContainerSpec)
const rootElement = document.getElementById('App') ?? document.body
const rootComponent = App
const rootProps = {container}

render(createElement(rootComponent, rootProps), rootElement)

// Hot Module Replacement (development mode) ///////////////////////////////////
// BEGIN
declare const module: {hot: {accept(): void}}
if (module.hot) {
    module.hot.accept()
}
// END

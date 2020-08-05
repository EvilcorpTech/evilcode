import {App} from './app/app'
import {ContainerSpec} from './lib/container'
import {createContainer} from '@eviljs/std-lib/container'
import {createElement} from 'react'
import {render} from 'react-dom'
import * as Context from './lib/context'

import './lib/theme.css'

const container = createContainer(ContainerSpec)
const rootElement = document.getElementById('App') ?? document.body
const rootComponent = App
const rootProps = {container}

render(createElement(rootComponent, rootProps), rootElement)

console.table({...Context})

if (module.hot) {
    module.hot.accept() // Enables Hot Module Replacement, only in development mode.
}

// Types ///////////////////////////////////////////////////////////////////////

declare const module: {hot: {accept(): void}}

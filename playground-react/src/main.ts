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

if (module.hot) {
    module.hot.accept()
}

// Types ///////////////////////////////////////////////////////////////////////

declare const module: {hot: {accept(): void}}

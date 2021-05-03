import {createContainer} from '@eviljs/std-lib/container.js'
import React from 'react'
import ReactDOM from 'react-dom'
import {App} from './app/app'
import {ContainerSpec} from './lib/container'
import * as Context from './lib/context'
const {createElement} = React
const {render} = ReactDOM

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

/// <reference path="@eviljs/reactx-webpack/types/assets.d.ts"/>
/// <reference path="@eviljs/reactx-webpack/types/react.d.ts"/>

declare const module: {hot: {accept(): void}}

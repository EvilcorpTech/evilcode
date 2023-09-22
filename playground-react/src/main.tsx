import '~/style/index.css'

import {createContainer} from '@eviljs/std/container'
import {createRoot} from 'react-dom/client'
import {ContainerSpec} from '~/container/container-apis'
import * as Env from '~/env/env-apis'
import {App, Root} from '~/root/root'
import {attachRootElement} from '~/root/root-apis'

console.table({...Env})

const container = createContainer(ContainerSpec)
const rootElement = attachRootElement()
const root = createRoot(rootElement)

root.render(
    <Root container={container}>
        <App/>
    </Root>
)

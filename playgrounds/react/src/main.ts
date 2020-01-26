import { AppSpec } from 'lib/app'
import { createApp } from 'std-react/app'
import * as Env from 'lib/env'

console.info({...Env})

createApp(AppSpec)
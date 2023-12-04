import type Koa from 'koa'
import type KoaStatic from 'koa-static'
import type Puppeteer from 'puppeteer'

import type {ParameterizedContext as KoaParameterizedContext} from 'koa'
import type {ServerSsrSettings} from './settings.js'

// Types ///////////////////////////////////////////////////////////////////////

export type KoaContext = KoaParameterizedContext<ServerContextState, ServerContext>

export interface ServerContext {
    koa: Koa<ServerContextState, ServerContext>
    koaStatic: ReturnType<typeof KoaStatic>
    ssrBrowser: Puppeteer.Browser
    ssrSettings: ServerSsrSettings
}

export interface ServerContextState {
    connectionId: number
}

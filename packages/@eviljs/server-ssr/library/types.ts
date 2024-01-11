import type Koa from 'koa'
import type {ParameterizedContext as KoaParameterizedContext} from 'koa'
import type KoaStatic from 'koa-static'
import type {Server} from 'node:http'
import type Puppeteer from 'puppeteer'
import type {ServerSsrSettings} from './settings.js'

// Types ///////////////////////////////////////////////////////////////////////

export type KoaInstance = Koa<ServerSsrContextState, ServerSsrContext>
export type KoaContext = KoaParameterizedContext<ServerSsrContextState, ServerSsrContext>

export interface ServerSsrContext {
    httpServer: Server,
    koa: Koa<ServerSsrContextState, ServerSsrContext>
    koaStatic: ReturnType<typeof KoaStatic>
    ssrBrowser: Puppeteer.Browser
    ssrSettings: ServerSsrSettings
}

export interface ServerSsrContextState {
    connectionId: number
}

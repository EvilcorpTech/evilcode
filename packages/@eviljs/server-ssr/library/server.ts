// https://github.com/puppeteer/puppeteer
// https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#class-page
// https://developers.google.com/web/tools/puppeteer/articles/ssr

import Koa from 'koa'
import KoaCompress from 'koa-compress'
import KoaConditionalGet from 'koa-conditional-get'
import KoaEtag from 'koa-etag'
import KoaStatic from 'koa-static'
import Http from 'node:http'
import Puppeteer from 'puppeteer'
import {serverMiddleware} from './middleware.js'
import type {ServerSsrSettings} from './settings.js'
import type {ServerSsrContext, ServerSsrContextState} from './types.js'

export let ConnectionCounter = 0

export async function startServer(settings: ServerSsrSettings): Promise<ServerSsrContext> {
    const browser = await Puppeteer.launch(settings.puppeteer)
    const koa = new Koa<ServerSsrContextState, ServerSsrContext>()
    const koaStatic = KoaStatic(settings.appDir, settings.koaStatic)
    const httpServer = Http.createServer(koa.callback())

    const serverContext: ServerSsrContext = {
        httpServer,
        koa,
        koaStatic,
        ssrBrowser: browser,
        ssrSettings: settings,
    }

    Object.assign(koa.context, serverContext)

    httpServer.on('error', error => {
        console.error('[server] http error', error)
        // browser.close()
        // httpServer.close()
    })

    koa.on('error', error => {
        console.error('[server] unexpected error', error)
    })

    process.on('exit', () => {
        console.info('[server] closes Puppeteer')
        browser.close()
    })

    process.on('SIGINT', () => {
        console.info('[server] terminates Puppeteer')
        browser.close()
        httpServer.close()
        process.exit(1)
    })

    if (settings.serverCompression) {
        koa.use(KoaCompress())
    }
    koa.use(KoaConditionalGet())
    koa.use(KoaEtag())
    settings.koa?.(koa)
    koa.use(serverMiddleware)

    httpServer.listen(settings.serverPort)

    return serverContext
}

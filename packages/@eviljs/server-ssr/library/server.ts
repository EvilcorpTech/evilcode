// https://github.com/puppeteer/puppeteer
// https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#class-page
// https://developers.google.com/web/tools/puppeteer/articles/ssr

import Koa from 'koa'
import KoaCompress from 'koa-compress'
import KoaConditionalGet from 'koa-conditional-get'
import KoaEtag from 'koa-etag'
import KoaStatic from 'koa-static'
import Puppeteer from 'puppeteer'
import {serverMiddleware} from './middleware.js'
import type {ServerSsrSettings} from './settings.js'
import type {ServerSsrContext, ServerSsrContextState} from './types.js'

export let ConnectionCounter = 0

export async function startServer(settings: ServerSsrSettings): Promise<ServerSsrContext> {
    const browser = await Puppeteer.launch(settings.puppeteer)
    const koa = new Koa<ServerSsrContextState, ServerSsrContext>()
    const koaStatic = KoaStatic(settings.appDir, settings.koaStatic)
    const serverContext: ServerSsrContext = {
        koa,
        koaStatic,
        ssrBrowser: browser,
        ssrSettings: settings,
    }

    Object.assign(koa.context, serverContext)

    koa.on('error', error => {
        console.error('[server] unexpected error', error)
    })

    process.on('exit', () => {
        if (! browser) {
            return
        }

        console.info('[server] closes Puppeteer')
        browser.close()
    })

    process.on('SIGINT', () => {
        if (browser) {
            console.info('[server] terminates Puppeteer')
            browser.close()
        }

        process.exit(1)
    })

    if (settings.serverCompression) {
        koa.use(KoaCompress())
    }
    koa.use(KoaConditionalGet())
    koa.use(KoaEtag())
    settings.koa?.(koa)
    koa.use(serverMiddleware)
    koa.listen(settings.serverPort)

    return serverContext
}

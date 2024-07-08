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

export async function startServerSsr(settings: ServerSsrSettings): Promise<ServerSsrContext> {
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
        console.error('[server:koa] unexpected error', error)
    })

    process.on('exit', () => {
        console.info('[server:koa] closes Puppeteer')
        browser.close()
    })

    process.on('SIGINT', () => {
        console.info('[server:koa] terminates Puppeteer')
        browser.close()
        process.exit(1)
    })

    if (settings.serverCompression) {
        koa.use(KoaCompress())
    }
    koa.use(KoaConditionalGet())
    koa.use(KoaEtag())
    settings.koa?.(koa)
    koa.use(serverMiddleware)

    return serverContext
}

export async function startServerHttp1(port: number, ctx: ServerSsrContext): Promise<ReturnType<typeof Http.createServer>> {
    const serverHttp1 = Http.createServer(ctx.koa.callback())

    process.on('SIGINT', () => {
        console.info('[server:http1] terminates server')
        serverHttp1.close()
        process.exit(1)
    })

    serverHttp1.on('error', error => {
        console.error('[server:http1] error', error)
    })

    serverHttp1.listen(port)

    return serverHttp1
}

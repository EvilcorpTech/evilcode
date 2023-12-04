import {OneDayInMs, OneHourInMs} from '@eviljs/std/date.js'
import type {ObjectPartial} from '@eviljs/std/type.js'
import type {Options as KoaStaticOptions} from 'koa-static'
import type {Page, PuppeteerLaunchOptions} from 'puppeteer'

export function configureServerSettings(options: ServerSsrOptions): ServerSsrSettings {
    const debug = options?.debug ?? false
    const serverCompression = options?.serverCompression ?? true
    const serverCacheExpires = options?.serverCacheExpires ?? OneHourInMs
    const serverPort = options?.serverPort ?? 8000
    const ssrCacheExpires = options?.ssrCacheExpires ?? OneDayInMs

    return {
        appDir: options?.appDir,
        debug,
        koaStatic: {
            index: 'index.html',
            extensions: ['.html'],
            hidden: false,
            maxage: serverCacheExpires,
            brotli: serverCompression,
            gzip: serverCompression,
            defer: false,
            ...options?.koaStatic,
        } ,
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--auto-open-devtools-for-tabs'],
            devtools: debug,
            headless: debug ? false : 'new',
            defaultViewport: {
                width: 360,
                height: 640,
                deviceScaleFactor: 1,
                hasTouch: false,
                isLandscape: false,
                isMobile: false,
            },
            ...options?.puppeteer,
        },
        serverCacheExpires,
        serverCompression,
        serverPort,
        ssrAllowedOrigins: options?.ssrAllowedOrigins ?? [],
        ssrAllowedResources: options?.ssrAllowedResources ?? ['document', 'script', 'stylesheet', 'xhr', 'fetch', 'other', 'image', 'font'],
        ssrAllowedRoutes: options?.ssrAllowedRoutes ?? [],
        ssrAppUrl: options?.ssrAppUrl ?? `http://127.0.0.1:${serverPort}`,
        ssrBrowserEvaluate: options?.ssrBrowserEvaluate,
        ssrBrowserWaitFor: options?.ssrBrowserWaitFor,
        ssrCache: options?.ssrCache ?? true,
        ssrCacheExpires,
        ssrCacheLimit: options?.ssrCacheLimit ?? 1_000,
        ssrRefreshParam: options?.ssrRefreshParam ?? 'ssr-refresh',
        ssrRequestParam: options?.ssrRequestParam ?? 'ssr',
        ssrTransformMainStylePattern: '/asset-main@[^.]+\.css$',
    }
}

export const LogIndentation = {
    Ssr: ' '.repeat(1),
    SsrTransform: ' '.repeat(1),
    SubResource: ' '.repeat(3),
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ServerSsrSettings {
    appDir: string
    debug: boolean
    koaStatic: KoaStaticOptions
    puppeteer: PuppeteerLaunchOptions
    serverCacheExpires: number
    serverCompression: boolean
    serverPort: number
    ssrAllowedOrigins: Array<string>
    ssrAllowedResources: Array<string>
    ssrAllowedRoutes: Array<string>
    ssrAppUrl: string
    ssrBrowserEvaluate: undefined | string
    ssrBrowserWaitFor: undefined | ((page: Page) => Promise<void>)
    ssrCache: boolean
    ssrCacheExpires: number
    ssrCacheLimit: number
    ssrRefreshParam: string
    ssrRequestParam: string
    ssrTransformMainStylePattern: string | RegExp
}

export type ServerSsrOptions =
    & Omit<ObjectPartial<ServerSsrSettings>, 'appDir'>
    & Pick<ServerSsrSettings, 'appDir'>

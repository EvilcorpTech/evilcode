import {OneDayInMs, OneMonthInMs} from '@eviljs/std/date'
import type {Computable} from '@eviljs/std/fn-compute'
import type {Io} from '@eviljs/std/fn-type'
import type {ObjectPartial} from '@eviljs/std/type'
import type {Options as KoaStaticOptions} from 'koa-static'
import {randomBytes} from 'node:crypto'
import type {Page, PuppeteerLaunchOptions} from 'puppeteer'
import type {KoaInstance} from './types.js'

export function configureServerSsrSettings(options: ServerSsrOptions): ServerSsrSettings {
    const debug = options?.debug ?? false
    const serverCompression = options?.serverCompression ?? true
    const serverCacheExpires = options?.serverCacheExpires ?? OneMonthInMs
    const serverEntryCacheExpires = options?.serverEntryCacheExpires ?? OneDayInMs
    const ssrCacheExpires = options?.ssrCacheExpires ?? OneDayInMs

    return {
        appDir: options?.appDir,
        debug,
        koa: options?.koa,
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
            headless: ! debug,
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
        serverEntryCacheExpires,
        ssrAllowedOrigins: options?.ssrAllowedOrigins ?? [],
        ssrAllowedResources: options?.ssrAllowedResources ?? ['document', 'script', 'stylesheet', 'xhr', 'fetch', 'other', 'image', 'font'],
        ssrAllowedRoutes: options?.ssrAllowedRoutes ?? [],
        ssrForbiddenRoutesBehavior: options?.ssrForbiddenRoutesBehavior ?? 'serve',
        ssrAppUrl: options?.ssrAppUrl ?? `http://127.0.0.1:8000`,
        ssrBrowserEvaluate: options?.ssrBrowserEvaluate,
        ssrBrowserWaitFor: options?.ssrBrowserWaitFor,
        ssrCache: options?.ssrCache ?? true,
        ssrCacheExpires,
        ssrCacheMemLimit: options?.ssrCacheMemLimit ?? 1_000,
        ssrProcessesLimitWithHighPriority: options?.ssrProcessesLimitWithHighPriority ?? 10, // Every Chrome tab requires at least 100mb of memory.
        ssrProcessesLimitWithLowPriority: options?.ssrProcessesLimitWithLowPriority ?? 1, // Every Chrome tab requires at least 100mb of memory.
        ssrRefreshParam: options?.ssrRefreshParam ?? 'ssr-refresh',
        ssrRequestParam: options?.ssrRequestParam ?? 'ssr',
        ssrTransformMainStylePattern: '/asset-main@[^.]+\.css$',
    }
}

export const LogIndentation: {
    Ssr: string
    SsrTransform: string
    SubResource: string
} = {
    Ssr: ' '.repeat(1),
    SsrTransform: ' '.repeat(1),
    SubResource: ' '.repeat(3),
}

export function createToken(length: number): string {
    const buffer = randomBytes(Math.trunc(length / 2)) // Bytes.
    const string = buffer.toString('hex') // Bytes x 2 (2 characters for every byte).

    return string.toLowerCase()
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ServerSsrSettings {
    appDir: string
    debug: boolean
    koa: undefined | Io<KoaInstance, void>
    koaStatic: KoaStaticOptions
    puppeteer: PuppeteerLaunchOptions
    serverCacheExpires: number
    serverCompression: boolean
    serverEntryCacheExpires: number
    ssrAllowedOrigins: Array<string>
    ssrAllowedResources: Array<string>
    ssrAllowedRoutes: undefined | Computable<undefined | Array<string>>
    ssrForbiddenRoutesBehavior: 'render-with-low-priority' | 'serve'
    ssrAppUrl: string
    ssrBrowserEvaluate: undefined | string
    ssrBrowserWaitFor: undefined | ((page: Page) => Promise<void>)
    ssrCache: boolean
    ssrCacheExpires: number
    ssrCacheMemLimit: number
    ssrProcessesLimitWithHighPriority: number
    ssrProcessesLimitWithLowPriority: number
    ssrRefreshParam: string
    ssrRequestParam: string
    ssrTransformMainStylePattern: string | RegExp
}

export type ServerSsrOptions =
    & Omit<ObjectPartial<ServerSsrSettings>, 'appDir'>
    & Pick<ServerSsrSettings, 'appDir'>

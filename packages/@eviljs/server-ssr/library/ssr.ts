// https://github.com/puppeteer/puppeteer
// https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#class-page
// https://developers.google.com/web/tools/puppeteer/articles/ssr

import {OneMinuteInMs} from '@eviljs/std/date.js'
import {piping, returnUndefined, tryCatch} from '@eviljs/std/fn.js'
import {isSome} from '@eviljs/std/type.js'
import {asBaseUrl} from '@eviljs/web/url.js'
import {createHash} from 'node:crypto'
import {mkdir, writeFile} from 'node:fs/promises'
import {resolve as resolvePath} from 'node:path'
import {parse, serialize} from 'parse5'
import {formatTimeAsSeconds, isDateTimeElapsed} from './datetime.js'
import {isElement, mappingElement, testingNodeName, type Parse5Element} from './parse5-apis.js'
import {LogIndentation} from './settings.js'
import type {KoaContext} from './types.js'

export const SsrCache = new Map<string, SsrCacheEntry>()
export const SsrJobs: Array<Promise<undefined | SsrResult>> = []

function pushSsrJob(ssrJob: Promise<undefined | SsrResult>) {
    SsrJobs.push(ssrJob)
    return ssrJob
}

function cleanSsrJob(ssrJob: Promise<undefined | SsrResult>) {
    const ssrJobIdx = SsrJobs.indexOf(ssrJob)

    if (ssrJobIdx === -1) {
        return
    }

    SsrJobs.splice(ssrJobIdx, 1)
}

async function waitSsrJobsQueue(ctx: KoaContext): Promise<void> {
    const {ssrSettings} = ctx

    console.debug(LogIndentation.Ssr, ctx.state.connectionId, '[server:ssr] active jobs:', SsrJobs.length)

    if (SsrJobs.length < ssrSettings.ssrProcessesLimit) {
        return
    }

    console.info(LogIndentation.Ssr, ctx.state.connectionId, `[server:ssr] jobs exceeded the limit of ${ssrSettings.ssrProcessesLimit}`)

    while (SsrJobs.length >= ssrSettings.ssrProcessesLimit) {
        console.info(LogIndentation.Ssr, ctx.state.connectionId, `[server:ssr] waiting ${SsrJobs.length - ssrSettings.ssrProcessesLimit} jobs above the limit`)

        try {
            await Promise.race(SsrJobs)
        }
        catch (error) {
            console.error(error)
        }
    }

    console.info(LogIndentation.Ssr, ctx.state.connectionId, '[server:ssr] a job completed. Continuing...')
}

export async function ssr(ctx: KoaContext): Promise<undefined | SsrResult> {
    return useSsrCache(ctx, async () => {
        await waitSsrJobsQueue(ctx)

        const ssrJob = pushSsrJob(computeSsrResult(ctx))

        try {
            return await ssrJob
        }
        finally {
            cleanSsrJob(ssrJob)
        }
    })
}

async function computeSsrResult(ctx: KoaContext): Promise<undefined | SsrResult> {
    const ssrRawResult = await useSsrRender(ctx).catch(error =>
        void console.error(LogIndentation.Ssr, ctx.state.connectionId, '[server:ssr] failed rendering due to', error)
    )
    const ssrTransformedResult = await useSsrTransform(ctx, ssrRawResult).catch(error =>
        void console.error(LogIndentation.Ssr, ctx.state.connectionId, '[server:ssr] failed transforming due to', error)
    )

    return ssrTransformedResult
}

export async function useSsrCache(ctx: KoaContext, ssrTask: () => Promise<undefined | SsrResult>): Promise<undefined | SsrResult> {
    const {ssrSettings} = ctx

    if (! ssrSettings.ssrCache) {
        // Cache is disabled. We act as a proxy to the ssr implementation.
        return ssrTask()
    }

    const cacheKey = computeCacheKey(ctx)
    const cachedEntry = SsrCache.get(cacheKey)
    const pleaseRefreshCache = (false
        || ctx.headers['cache-control'] === 'no-cache'
        || ssrSettings.ssrRefreshParam in ctx.query
    )
    const shouldRefreshCache = true
        && pleaseRefreshCache
        && cachedEntry
        // It must elapse at least 1 minute between cache refresh requests,
        // avoiding cache invalidation malicious bombing.
        && isDateTimeElapsed(cachedEntry.result.created, OneMinuteInMs)
    const cacheIsFree = SsrCache.size < ssrSettings.ssrCacheLimit
    const cacheIsExpired = Date.now() > (cachedEntry?.expires ?? 0)

    const logIndent = LogIndentation.Ssr

    if (! cachedEntry) {
        // There is not a cached entry.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] missed')
    }
    if (cachedEntry && cacheIsExpired) {
        // There is a cached entry but it is expired.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] expired')
    }
    if (cachedEntry && ! cacheIsExpired && pleaseRefreshCache && shouldRefreshCache) {
        // There is a cached entry, it is not expired, wre are requested to refresh it and it is a valid request.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] refreshing')
    }
    if (cachedEntry && ! cacheIsExpired && pleaseRefreshCache && ! shouldRefreshCache) {
        // There is a cached entry, it is not expired, wre are requested to refresh it but it is an invalid request.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] not refreshing')
    }
    if (cachedEntry && ! cacheIsExpired && ! shouldRefreshCache) {
        // There is a cached entry, it is not expired and we are not requested to refresh.
        const remainingTime = cachedEntry.expires - Date.now()
        console.info(logIndent, ctx.state.connectionId, `[server:ssr-cache] hit (expires in ${formatTimeAsSeconds(remainingTime)}s)`)

        return cachedEntry.result
    }

    const result = await ssrTask()

    if (! result) {
        console.warn(logIndent, ctx.state.connectionId, '[server:ssr-cache] no result')

        return result
    }

    if (! cacheIsFree && ! cachedEntry) {
        // We have no more space for a new cached entry.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] limit reached')
    }
    if (cacheIsFree || cachedEntry) {
        // We have space for a new entry or the cached entry already exists.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] saved')

        const expires = result.created + ssrSettings.ssrCacheExpires

        SsrCache.set(cacheKey, {result, expires})
    }

    return result
}

export async function useSsrRender(ctx: KoaContext): Promise<undefined | SsrResult> {
    const {ssrBrowser, ssrSettings} = ctx
    const start = Date.now()

    const logIndent = LogIndentation.Ssr

    console.info(logIndent, ctx.state.connectionId, '[server:ssr] starts page')
    console.debug(logIndent, ctx.state.connectionId, '[server:ssr] headers are', ctx.req.headers)

    const baseUrl = ssrBaseUrlOf(ctx)
    const appUrl = new URL(ctx.path, baseUrl)
    appUrl.searchParams.set(ssrSettings.ssrRequestParam, '')

    const browserPage = await ssrBrowser.newPage()

    await browserPage.setRequestInterception(true)

    browserPage.on('request', request => {
        const isAllowedResource = ssrSettings.ssrAllowedResources.includes(request.resourceType())
        const isAllowedOrigin = [baseUrl, ...ssrSettings.ssrAllowedOrigins].some(it => request.url().startsWith(it))

        if (! isAllowedResource) {
            console.info(logIndent, ctx.state.connectionId, '[server:ssr] ✕ blocked request type', request.resourceType(), request.url())

            request.abort()

            return
        }
        if (! isAllowedOrigin) {
            console.info(logIndent, ctx.state.connectionId, '[server:ssr] ✕ blocked request origin', request.url())

            request.abort()

            return
        }

        console.info(logIndent, ctx.state.connectionId, '[server:ssr] ‧ loading', request.resourceType(), request.url())

        request.continue()
    })

    console.info(logIndent, ctx.state.connectionId, '[server:ssr] ⤷ renders', appUrl.href)

    try {
        await browserPage.goto(appUrl.toString(), {
            // Waits for the network to be idle (no requests for 500ms).
            waitUntil: ['domcontentloaded', 'load', 'networkidle0'],
        })

        try {
            await ssrSettings.ssrBrowserWaitFor?.(browserPage)
        }
        catch (error) {
            console.error(error)
        }

        if (ssrSettings.ssrBrowserEvaluate) {
            await browserPage.evaluate(ssrSettings.ssrBrowserEvaluate)
        }

        const body = await browserPage.content()

        console.info(logIndent, ctx.state.connectionId, `[server:ssr] ⤷ rendered in ${Date.now() - start}ms`)

        return {body, created: Date.now()}
    }
    catch (error) {
        console.error(logIndent, ctx.state.connectionId, '[server:ssr] ⤷ error navigating page', ctx.path, '\n', error)
    }
    finally {
        console.info(logIndent, ctx.state.connectionId, '[server:ssr] ⤷ closes page')

        try {
            await browserPage.close()
        }
        catch (error) {
            console.error(logIndent, ctx.state.connectionId, '[server:ssr] ⤷ error closing page')
        }
    }

    return // Makes TypeScript happy.
}

export async function useSsrTransform(ctx: KoaContext, result: undefined | SsrResult): Promise<undefined | SsrResult> {
    const {ssrSettings} = ctx

    function warnBundlingSkipped(reason: any): undefined {
        console.warn(LogIndentation.SsrTransform, ctx.state.connectionId, '[server:ssr-transform] skipping stylesheets bundling due to condition', reason)
    }

    if (! result) {
        warnBundlingSkipped(1)
        return result
    }

    const document = tryCatch(() => parse(result.body), console.error)

    if (! document) {
        warnBundlingSkipped(2)
        return result
    }

    const transformedResult = {...result}

    const externalStyles = piping(document)
        (document => document.childNodes.find(testingNodeName('html')))
        (mappingElement(htmlNode => htmlNode.childNodes.find(testingNodeName('head')), returnUndefined))
        (mappingElement(headNode => headNode?.childNodes.filter((link): link is Parse5Element =>
            true
            && isElement(link)
            && link.nodeName === 'link'
            && link.attrs.some(attr => attr.name === 'rel' && attr.value === 'stylesheet')
        ), returnUndefined))
    ()

    // The index.css must be untouched, and the other 2 or more stylesheets should be bundled.
    const mainStyle = externalStyles?.find(link => link.attrs.find(attr =>
        true
        && attr.name === 'href'
        && attr.value.match(ssrSettings.ssrTransformMainStylePattern),
    ))
    const otherStyles = externalStyles?.filter(link => link !== mainStyle)

    if (! mainStyle) {
        warnBundlingSkipped(3)
        return result
    }
    if (! otherStyles || otherStyles.length < 2) {
        warnBundlingSkipped(4)
        // We need at least 2 other external stylesheets for the optimization to take place.
        return result
    }

    const mainStyleParent = mainStyle.parentNode

    if (! mainStyleParent) {
        warnBundlingSkipped(5)
        return result
    }

    const mainStyleIdx = mainStyleParent.childNodes.indexOf(mainStyle)

    if (mainStyleIdx < 0) {
        warnBundlingSkipped(6)
        return result
    }

    const baseUrl = ssrBaseUrlOf(ctx)

    const otherStylesUrls = otherStyles
        .map(link => link.attrs.find(attr => attr.name === 'href')?.value)
        .filter(isSome)

    if (otherStylesUrls.length < 2) {
        warnBundlingSkipped(7)
        return result
    }

    const otherStylesContent = await Promise.all(
        otherStylesUrls.map(url =>
            fetch(new URL(url, baseUrl).href).then(it => it.text()).then(result => ({
                url: url,
                content: result,
            }))
        ),
    ).catch((error): undefined => void console.error(error))

    if (! otherStylesContent) {
        warnBundlingSkipped(8)
        return result
    }

    const otherStylesBundleContent = otherStylesContent.map(it =>
        ''
        + `/* ${it.url} */\n`
        + `${it.content}\n`
    ).join('')

    const otherStylesBundleHash = createHash('sha256')
        .update(otherStylesBundleContent)
        .digest('hex')
        .slice(0, 6)

    const otherStylesBundleDirName = 'bundle-styles'
    const otherStylesBundleName = `${otherStylesBundleDirName}/styles-${otherStylesBundleHash}.css`
    const otherStylesBundleDirPath = resolvePath(ssrSettings.appDir, otherStylesBundleDirName)
    const otherStylesBundlePath = resolvePath(ssrSettings.appDir, otherStylesBundleName)

    await mkdir(otherStylesBundleDirPath, {recursive: true})
    await writeFile(otherStylesBundlePath, otherStylesBundleContent)

    console.info(LogIndentation.SsrTransform, ctx.state.connectionId, '[server:ssr-transform] bundling stylesheets to', otherStylesBundlePath)

    otherStyles.forEach(link => link.attrs.push(
        {name: 'disabled', value: ''},
        {name: 'media', value: 'print'},
    ))

    mainStyleParent.childNodes.splice(mainStyleIdx + 1, 0, {
        ...mainStyle,
        attrs: mainStyle.attrs.map(it =>
            it.name === 'href'
                ? {...it, value: `/${otherStylesBundleName}`}
                : it
        ),
    })

    // TODO
    // <script>
    //     document.head.querySelectorAll('link,script').forEach(it => it.dataset.ssr = '')
    // </script>

    transformedResult.body = serialize(document)
    transformedResult.body = transformedResult.body.replaceAll(/\n +/g, '\n') // Minifies, compressing leading empty spaces.

    return transformedResult
}

export function ssrBaseUrlOf(ctx: KoaContext): string {
    const {ssrSettings} = ctx
    const schema = ctx.req.headers['x-forwarded-proto']
        ? ctx.req.headers['x-forwarded-proto']
        : ctx.protocol
    const baseUrl = ssrSettings.ssrAppUrl || `${schema}://${ctx.req.headers.host}`
    return baseUrl
}

export function computeCacheKey(ctx: KoaContext): string {
    return asBaseUrl(ctx.path) // Without the trailing slash.
}

// Types ///////////////////////////////////////////////////////////////////////

export type SsrResult = SsrRenderOutput

export interface SsrRenderOutput {
    body: string
    created: number
}

interface SsrCacheEntry {
    result: SsrRenderOutput
    expires: number
}

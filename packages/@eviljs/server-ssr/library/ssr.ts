// https://github.com/puppeteer/puppeteer
// https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#class-page
// https://developers.google.com/web/tools/puppeteer/articles/ssr

import {piping} from '@eviljs/std/pipe.js'
import {returnUndefined} from '@eviljs/std/return.js'
import {tryCatch} from '@eviljs/std/try.js'
import {isSome} from '@eviljs/std/type.js'
import {createHash} from 'node:crypto'
import {mkdir, writeFile} from 'node:fs/promises'
import {resolve as resolvePath} from 'node:path'
import {parse, serialize} from 'parse5'
import {formatTimeAsSeconds} from './datetime.js'
import {isElement, mappingElement, testingNodeName, type Parse5Element} from './parse5-apis.js'
import {LogIndentation} from './settings.js'
import type {KoaContext} from './types.js'
import {asBaseUrl} from '@eviljs/web/url.js'

export const SsrCache = new Map<string, SsrCacheEntry>()

export async function ssr(ctx: KoaContext): Promise<undefined | SsrResult> {
    return ssrCache(ctx, async () =>
        ssrTransform(ctx,
            await ssrRender(ctx)
        )
    )
}

export async function ssrCache(ctx: KoaContext, ssrTask: () => Promise<undefined | SsrResult>): Promise<undefined | SsrResult> {
    const {ssrSettings} = ctx

    if (! ssrSettings.ssrCache) {
        // Cache is disabled. We act as a proxy to the ssr implementation.
        return ssrTask()
    }

    const cacheKey = computeCacheKey(ctx)
    const cachedEntry = SsrCache.get(cacheKey)
    const shouldRefreshCache = true
        && ssrSettings.ssrRefreshParam in ctx.query
        && ctx.query[ssrSettings.ssrRefreshParam] === ssrSettings.ssrRefreshToken
    const isCacheFree = SsrCache.size < ssrSettings.ssrCacheLimit
    const isCacheExpired = Date.now() > (cachedEntry?.expires ?? 0)

    const logIndent = LogIndentation.Ssr

    if (! cachedEntry) {
        // There is not a cached entry.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] missed')
    }
    if (cachedEntry && isCacheExpired) {
        // There is a cached entry but it is expired.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] expired')
    }
    if (cachedEntry && ! isCacheExpired && shouldRefreshCache) {
        // There is a cached entry, it is not expired but we are forced to refresh.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] refreshing')
    }
    if (cachedEntry && ! isCacheExpired && ! shouldRefreshCache) {
        // There is a cached entry, it is not expired and we are not forced to refresh.
        const remainingTime = cachedEntry.expires - Date.now()
        console.info(logIndent, ctx.state.connectionId, `[server:ssr-cache] hit (expires in ${formatTimeAsSeconds(remainingTime)}s)`)

        return cachedEntry.result
    }

    const result = await ssrTask()

    if (! result) {
        console.warn(logIndent, ctx.state.connectionId, '[server:ssr-cache] no result')

        return result
    }

    if (! isCacheFree && ! cachedEntry) {
        // We have no more space for a new cached entry.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] limit reached')
    }
    if (isCacheFree || cachedEntry) {
        // We have space for a new entry or the cached entry already exists.
        console.info(logIndent, ctx.state.connectionId, '[server:ssr-cache] saved')

        const expires = result.created + ssrSettings.ssrCacheExpires

        SsrCache.set(cacheKey, {result, expires})
    }

    return result
}

export async function ssrRender(ctx: KoaContext): Promise<undefined | SsrResult> {
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

export async function ssrTransform(ctx: KoaContext, result: undefined | SsrResult): Promise<undefined | SsrResult> {
    const {ssrSettings} = ctx

    function warnBundlingSkipped(reason: any): undefined {
        console.warn(LogIndentation.SsrTransform, ctx.state.connectionId, '[server:ssr-transform] skipping stylesheets bundling due to condition', reason)
    }

    if (! result) {
        warnBundlingSkipped(1)
        return result
    }

    const document = tryCatch(() => parse(result.body))

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

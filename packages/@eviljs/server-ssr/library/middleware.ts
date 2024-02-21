import {assertDefined} from '@eviljs/std/assert.js'
import {OneSecondInMs} from '@eviljs/std/date.js'
import {compute} from '@eviljs/std/fn.js'
import {isDefined} from '@eviljs/std/type.js'
import {asBaseUrl} from '@eviljs/web/url.js'
import type Koa from 'koa'
import {LogIndentation} from './settings.js'
import {ssr} from './ssr.js'
import type {KoaContext} from './types.js'

const ApiRegexp = /^\/api\//
const FileRegexp = /.+\.\w+$/

export let ConnectionCounter = 0

/*
* Browser
* |
* | requests http://domain.com/page/
* | to the Server (on IP 0.0.0.0)
* |
* +==> the Server (on IP 0.0.0.0)
*    |
*    | opens Puppeteer requesting url http://127.0.0.1/page/?ssr
*    |
*    +==> Puppeteer
*       |
*       | requests http://127.0.0.1/page/?ssr
*       | to the Server (on IP 127.0.0.1)
*       |
*       +==> the Server (on IP 127.0.0.1)
*          |
*          | because there is the ?ssr flags
*          | and because the requested path is not a file but a virtual path
*          | is forced to return the static index.html file
*          | to Puppeteer
*          |
*       <==| Puppeteer
*       |
*       | parses http://127.0.0.1/page/?ssr
*       | which is the index.html
*       | and requests the external resources
*       | to the Server (on IP 127.0.0.1):
*       | - http://127.0.0.1/app.js
*       | - http://127.0.0.1/style.css
*       | - http://127.0.0.1/image.png
*       |
*       +==> the Server (on IP 127.0.0.1):
*          |
*          | because these requests are files due to the .{ext} inside the name
*          | is forced to return these static files
*          | to Puppeteer
*          |
*       <==| Puppeteer
*       |
*       | has all the external resources
*       | and can render http://127.0.0.1/page/?ssr
*       | returning the HTML output
*       | to the Server (on IP 0.0.0.0)
*       |
*    <==| the Server (on IP 0.0.0.0)
*    |
*    | returns the rendered page for http://domain.com/page/
*    | to the Browser
*    |
* <==| Browser
* |
* | parses the http://domain.com/page/
* | with the server side rendered content.
* |
* END
*/
export async function serverMiddleware(ctx: KoaContext, next: Koa.Next) {
    const {koaStatic, ssrSettings} = ctx
    ctx.state.connectionId = ++ConnectionCounter

    const logIndent = LogIndentation.SubResource

    if (isRequestHandled(ctx)) {
        // The request is already handled by another middleware.
        console.info(ctx.state.connectionId, '[server:koa] skipping request already handled:', ctx.path, {...ctx.query})

        return next()
    }

    // if (isRequestOfApi(ctx)) {
    //     // The request points to an API endpoint.
    //     console.info(logIndent, ctx.state.connectionId, '[server:koa] skipping request of API:', ctx.path, {...ctx.query})
    //
    //     return next()
    // }

    if (isRequestOfFile(ctx)) {
        // The request points to a static asset file (for example /app.js).
        console.info(logIndent, ctx.state.connectionId, '[server:koa] serving request of Static File:', ctx.path, {...ctx.query})

        return koaStatic(ctx, next)
    }

    if (isRequestFromSsr(ctx)) {
        // The request points to an app routing path (for example /dashboard/)
        // and it comes from SSR (/dashboard/?ssr).
        console.info(logIndent, ctx.state.connectionId, '[server:koa] serving request of Entry Point (from SSR):', ctx.path, {...ctx.query})

        ctx.path = '/index.html'

        return koaStatic(ctx, next)
    }

    if (! isRequestOfRouteAllowed(ctx)) {
        // The request points to an app routing path (for example /article/1/)
        // but it is not eligible for SSR.
        console.info(ctx.state.connectionId, '[server:koa] serving request of Entry Point (not SSR):', ctx.path, {...ctx.query})

        ctx.path = '/index.html'

        return koaStatic(ctx, next)
    }

    // The request points to an app routing path (for example /dashboard/),
    // it is an allowed route and it does not come from SSR.
    console.info(ctx.state.connectionId, '[server:koa] serving request of Route SSR:', ctx.path, {...ctx.query})

    try {
        const ssrResult = await ssr(ctx)

        assertDefined(ssrResult, 'ssrResult')

        if (! ctx.response.get('Last-Modified')) {
            ctx.set('Last-Modified', new Date(ssrResult.created).toUTCString())
        }
        if (! ctx.response.get('Cache-Control')) {
            ctx.set('Cache-Control', `max-age=${(ssrSettings.serverEntryCacheExpires / OneSecondInMs)}`)
        }

        ctx.status = 200 // OK.
        ctx.body = ssrResult.body
    }
    catch (error) {
        console.error(ctx.state.connectionId, '[server:koa] ⤷ failed to Server Side Render due to:', error)

        ctx.status = 500 // Internal Server Error.
        ctx.body = '[server:koa] Internal Server Error (ERROR:FA76)'
    }

    return next()
}

export function isRequestHandled(ctx: KoaContext) {
    return isDefined(ctx.body)
}

export function isRequestOfApi(ctx: KoaContext) {
    return ApiRegexp.test(ctx.path)
}

export function isRequestOfFile(ctx: KoaContext) {
    return FileRegexp.test(ctx.path)
}

export function isRequestFromSsr(ctx: KoaContext) {
    return ctx.ssrSettings.ssrRequestParam in ctx.query
}

export function isRequestOfRouteAllowed(ctx: KoaContext) {
    const ssrAllowedRoutes = compute(ctx.ssrSettings.ssrAllowedRoutes).map(asBaseUrl) // Without the trailing slash.
    return ssrAllowedRoutes.includes(asBaseUrl(ctx.path))
}

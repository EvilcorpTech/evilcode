import {OneSecondInMs} from '@eviljs/std/date.js'
import {compute} from '@eviljs/std/fn-compute.js'
import {assertDefined} from '@eviljs/std/type-assert.js'
import {isDefined} from '@eviljs/std/type-is.js'
import {asBaseUrl} from '@eviljs/web/url-path.js'
import {LogIndentation} from './settings.js'
import {SsrJobPriority} from './ssr-scheduler.js'
import {ssr} from './ssr.js'
import type {KoaContext, KoaNext} from './types.js'

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
export async function serverMiddleware(ctx: KoaContext, next: KoaNext) {
    const {koaStatic, ssrSettings} = ctx

    ctx.state.connectionId = ++ConnectionCounter

    const logIndent = LogIndentation.SubResource

    if (isRequestHandled(ctx)) {
        // The request is already handled by another middleware.
        ctx.ssrRequestType = 'handled'

        if (ssrSettings.debug) {
            console.debug(ctx.state.connectionId, `[server:koa] skipping request already handled "${ctx.path}".`)
        }

        return next()
    }

    // if (isRequestOfApi(ctx)) {
    //     // The request points to an API endpoint like `/api/something`.
    //     ctx.ssrRequestType = 'api'
    //
    //     if (ssrSettings.debug) {
    //         console.debug(logIndent, ctx.state.connectionId, '[server:koa] skipping API:', ctx.path)
    //     }
    //
    //     return next()
    // }

    if (isRequestOfFile(ctx)) {
        // The request points to a static asset file like `/app.js`.
        ctx.ssrRequestType = 'file'

        if (ssrSettings.debug) {
            console.debug(logIndent, ctx.state.connectionId, `[server:koa] serving static file "${ctx.path}".`)
        }

        return koaStatic(ctx, next)
    }

    if (isRequestFromSsr(ctx)) {
        // The request points to an app routing path like `/dashboard/?ssr`.
        ctx.ssrRequestType = 'file'

        if (ssrSettings.debug) {
            console.debug(logIndent, ctx.state.connectionId, `[server:koa] serving static file entry point due to SSR flag "${ctx.path}".`)
        }

        ctx.path = '/index.html'

        return koaStatic(ctx, next)
    }

    if (! isRequestOfRouteAllowed(ctx)) {
        switch (ctx.ssrSettings.ssrForbiddenRoutesBehavior) {
            case 'render-with-low-priority': {
                // The request points to an app routing path like `/page/not-existing`.
                ctx.ssrRequestType = 'render'

                console.info(ctx.state.connectionId, `[server:koa] server side rendering route with ${SsrJobPriority.Low} priority "${ctx.path}".`)

                return serveSsrRenderRequest(ctx, SsrJobPriority.Low, next)
            }
            case 'serve': {
                // The request points to an app routing path (for example /article/1/)
                // but it is not eligible for SSR.
                ctx.ssrRequestType = 'file'

                console.info(ctx.state.connectionId, `[server:koa] serving static file entry point because SSR is not allowed "${ctx.path}".`)

                ctx.path = '/index.html'

                return koaStatic(ctx, next)
            }
        }
    }

    // The request points to an app routing path (for example /dashboard/),
    // it is an allowed route and it does not come from SSR.
    ctx.ssrRequestType = 'render'

    console.info(ctx.state.connectionId, `[server:koa] server side rendering route with ${SsrJobPriority.High} priority "${ctx.path}".`)

    return serveSsrRenderRequest(ctx, SsrJobPriority.High, next)
}

async function serveSsrRenderRequest(ctx: KoaContext, priority: SsrJobPriority, next: KoaNext) {
    const {ssrSettings} = ctx

    try {
        const ssrResult = await ssr(ctx, priority)

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
        console.error(ctx.state.connectionId, '[server:koa] ⤷ failed to server side render.', error)

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
    const allowedRoutes = compute(ctx.ssrSettings.ssrAllowedRoutes)

    if (! allowedRoutes) {
        return true
    }

    const ssrAllowedRoutes = allowedRoutes.map(asBaseUrl) // Without the trailing slash.
    return ssrAllowedRoutes.includes(asBaseUrl(ctx.path))
}

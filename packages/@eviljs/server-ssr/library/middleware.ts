import {OneSecondInMs} from '@eviljs/std/date.js'
import type Koa from 'koa'
import {LogIndentation} from './settings.js'
import {ssr} from './ssr.js'
import type {KoaContext} from './types.js'

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

    const isRequestFromSsr = ssrSettings.ssrRequestParam in ctx.query
    const isRequestOfApi = /^\/api/.test(ctx.path)
    const isRequestOfStatic = ! isRequestOfApi && /.+\.\w+$/.test(ctx.path)
    const isRequestOfRoute = ! isRequestOfApi && ! isRequestOfStatic
    const isRequestOfRouteAllowed = isRequestOfRoute && ssrSettings.ssrAllowedRoutes.includes(ctx.path)
    const isRequestOfRouteFromSsr = isRequestOfRoute && isRequestFromSsr
    const isRequestOfRouteToSsr = isRequestOfRouteAllowed && ! isRequestFromSsr
    const isRequestOfSubResource = false
        || isRequestOfApi
        || isRequestOfStatic
        || isRequestOfRouteFromSsr

    const logIndent = LogIndentation.SubResource

    if (isRequestOfApi) {
        // The request points to an API endpoint.
        console.info(logIndent, ctx.state.connectionId, '[server] skipping request of API', ctx.path, {...ctx.query})

        return next()
    }

    if (isRequestOfStatic) {
        // The request points to a static asset file (for example /app.js).
        console.info(logIndent, ctx.state.connectionId, '[server] serving request of StaticFile', ctx.path, {...ctx.query})

        return koaStatic(ctx, next)
    }

    if (isRequestOfRouteFromSsr || (isRequestOfRoute && ! isRequestOfRouteAllowed)) {
        if (isRequestOfRouteFromSsr) {
            // The request points to an app routing path (for example /dashboard)
            // and it comes from SSR (/dashboard?ssr).
            console.info(logIndent, ctx.state.connectionId, '[server] serving request of RouteEntry (from SSR)', ctx.path, {...ctx.query})
        }
        else if (isRequestOfRoute && ! isRequestOfRouteAllowed) {
            // The request points to an app routing path (for example /article/1)
            // but it is not eligible for SSR.
            console.info(ctx.state.connectionId, '[server] serving request of RouteEntry (not SSR)', ctx.path, {...ctx.query})
        }

        ctx.path = '/index.html'

        return koaStatic(ctx, next)
    }

    if (isRequestOfRouteToSsr) {
        // The request points to an app routing path (for example /dashboard)
        // and it does not come from SSR.
        console.info(ctx.state.connectionId, '[server] serving request of Route SSR', ctx.path, {...ctx.query})

        const page = await ssr(ctx)

        if (! page) {
            console.error(ctx.state.connectionId, '[server] ⤷ failed to Server Side Render')

            ctx.status = 500 // Internal Server Error.
            ctx.body = '[server] Internal Server Error (ERROR:FA76)'

            return next()
        }

        if (! ctx.response.get('Last-Modified')) {
            ctx.set('Last-Modified', new Date(page.created).toUTCString())
        }
        if (! ctx.response.get('Cache-Control')) {
            ctx.set('Cache-Control', `max-age=${(ssrSettings.serverCacheExpires / OneSecondInMs)}`)
        }

        ctx.status = 200 // OK.
        ctx.body = page.body

        return next()
    }

    return next()
}

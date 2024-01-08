import {OneSecondInMs} from '@eviljs/std/date.js'
import {isDefined} from '@eviljs/std/type.js'
import type Koa from 'koa'
import {LogIndentation} from './settings.js'
import {ssr, type SsrResult} from './ssr.js'
import type {KoaContext} from './types.js'

const ApiRegexp = /^\/api\//
const FileRegexp = /.+\.\w+$/
export let ConnectionCounter = 0

const SsrJobs: Array<Promise<SsrResult>> = []

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

    const isRequestHandled = isDefined(ctx.body)
    if (isRequestHandled) {
        // The request is already handled by another middleware.
        console.info(ctx.state.connectionId, '[server] skipping request already handled of', ctx.path, {...ctx.query})

        return next()
    }

    const isRequestOfApi = ApiRegexp.test(ctx.path)
    if (isRequestOfApi) {
        // The request points to an API endpoint.
        console.info(logIndent, ctx.state.connectionId, '[server] skipping request of API', ctx.path, {...ctx.query})

        return next()
    }

    const isRequestOfStatic = FileRegexp.test(ctx.path)
    if (isRequestOfStatic) {
        // The request points to a static asset file (for example /app.js).
        console.info(logIndent, ctx.state.connectionId, '[server] serving request of StaticFile', ctx.path, {...ctx.query})

        return koaStatic(ctx, next)
    }

    const isRequestFromSsr = ssrSettings.ssrRequestParam in ctx.query
    if (isRequestFromSsr) {
        // The request points to an app routing path (for example /dashboard)
        // and it comes from SSR (/dashboard?ssr).
        console.info(logIndent, ctx.state.connectionId, '[server] serving request of Entry Point (from SSR)', ctx.path, {...ctx.query})

        ctx.path = '/index.html'

        return koaStatic(ctx, next)
    }

    const isRequestOfRouteAllowed = ssrSettings.ssrAllowedRoutes.includes(ctx.path)
    if (! isRequestOfRouteAllowed) {
        // The request points to an app routing path (for example /article/1)
        // but it is not eligible for SSR.
        console.info(ctx.state.connectionId, '[server] serving request of Entry Point (not SSR)', ctx.path, {...ctx.query})

        ctx.path = '/index.html'

        return koaStatic(ctx, next)
    }

    // The request points to an app routing path (for example /dashboard),
    // it is an allowed route and it does not come from SSR.
    console.info(ctx.state.connectionId, '[server] serving request of Route SSR', ctx.path, {...ctx.query})

    console.info(ctx.state.connectionId, '[server] active jobs', SsrJobs.length)

    if (SsrJobs.length >= ssrSettings.ssrProcessesLimit) {
        console.info(ctx.state.connectionId, `[server] jobs exceeded the limit of ${ssrSettings.ssrProcessesLimit}. Waiting...`)

        while (SsrJobs.length >= ssrSettings.ssrProcessesLimit) {
            try {
                await Promise.race(SsrJobs)
            }
            catch (error) {
                console.error(error)
            }
        }

        console.info(ctx.state.connectionId, '[server] a job completed. Continuing...')
    }

    const ssrJob = ssr(ctx)

    SsrJobs.push(ssrJob)

    try {
        const page = await ssrJob

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
            ctx.set('Cache-Control', `max-age=${(ssrSettings.serverEntryCacheExpires / OneSecondInMs)}`)
        }

        ctx.status = 200 // OK.
        ctx.body = page.body
    }
    catch (error) {
        console.error(error)
    }

    const ssrJobIdx = SsrJobs.indexOf(ssrJob)

    if (ssrJobIdx >= 0) {
        SsrJobs.splice(ssrJobIdx, 1)
    }

    return next()
}

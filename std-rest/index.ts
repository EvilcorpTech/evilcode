import { Context, Next } from 'koa'
import { Logger } from '@eviljs/std-lib/logger'
import { setupRouter, Routes } from './routing'
import Http from 'http'
import Koa from 'koa'
import KoaBodyParser from 'koa-bodyparser'
import KoaCompress from 'koa-compress'
import KoaConditionalGet from 'koa-conditional-get'
import KoaEtag from 'koa-etag'
import KoaLogger from 'koa-logger'
import KoaMount from 'koa-mount'
import KoaRouter from '@koa/router'
import KoaStatic from 'koa-static'

export const ApiPath = '/api'
export const StaticDir = './public'
export const StaticMaxAge = 1000 * 60 * 60 * 24 // 1 day. Don't Cache-Control for too long, otherwise the ETag is frustrated.
export const HttpAddr = 'localhost'
export const HttpPort = 8080

export function RestService<C, M>(container: RestContainer<C, M>) {
    const { RestSpec: restSpec } = container
    const { Context: context, Logger: logger } = container

    const spec = {
        apiPath: restSpec?.apiPath,
        context: {container, ...restSpec?.context},
        httpAddr: context?.REST_ADDR ?? process.env.REST_ADDR ?? restSpec?.httpAddr,
        httpPort: context?.REST_PORT ?? process.env.REST_PORT ?? restSpec?.httpPort,
        logger: restSpec?.logger ?? logger,
        maxAge: restSpec?.maxAge,
        middleware: restSpec?.middleware,
        staticDir: restSpec?.staticDir,
    }

    return createRest(spec)
}

export function createRest<T>(spec?: RestSpec<T>) {
    process.on('unhandledRejection', createErrorHandler(spec))

    const app = createRestApp(spec)
    const server = createRestServer(app, spec)

    return {server, app}
}

export function createErrorHandler(spec?: RestSpec) {
    const logger = spec?.logger ?? console

    function rejectionHandler(reason: any, promise: Promise<any>) {
        logger.error('Unhandled Rejection:', reason?.stack ?? reason)
    }

    return rejectionHandler
}

export function createRestApp<T>(spec?: RestSpec<T>) {
    const apiPath = spec?.apiPath ?? ApiPath
    const staticDir = spec?.staticDir ?? StaticDir
    const staticOpts = {
        maxage: spec?.maxAge ?? StaticMaxAge,
    }
    const context = spec?.context
    type KoaState = Koa.DefaultState
    type KoaCtx = Koa.DefaultContext & typeof context
    const app = new Koa<KoaState, KoaCtx>()
    const routes = spec?.middleware?.map(endpoint => endpoint(spec))
    const router = setupRouter(new KoaRouter(), routes)

    console.info(
        `@eviljs/std-rest/index.createRestApp(): serving APIs on ${apiPath}.`
    )
    console.info(
        `@eviljs/std-rest/index.createRestApp(): serving static contents from ${staticDir} with max-age ${staticOpts.maxage}.`
    )

    Object.assign(app.context, context)
    app.on('error', createKoaAppErrorHandler(spec))
    app.use(createKoaAppErrorMiddleware(spec)) // It must be the first middleware.
    app.use(KoaLogger())
    app.use(KoaConditionalGet())
    app.use(KoaEtag())
    app.use(KoaStatic(staticDir, staticOpts))
    app.use(KoaBodyParser())
    app.use(KoaMount(apiPath, router.routes()))
    app.use(KoaMount(apiPath, router.allowedMethods()))
    app.use(KoaCompress())

    return app
}

export function createRestServer(app: Koa<any, any>, spec?: RestSpec) {
    const addr = spec?.httpAddr ?? HttpAddr
    const port = spec?.httpPort ?? HttpPort
    const server = Http.createServer(app.callback())

    console.info(
        `@eviljs/std-rest/index.createRestServer(): listening on ${addr}:${port}.`
    )

    server.listen(Number(port), addr)

    process.on('exit', code => {
        console.debug(
            '@eviljs/std-rest/index.createRestServer(): closing.'
        )
        server.close()
    })

    return server
}

export function createKoaAppErrorMiddleware(spec?: RestSpec) {
    async function koaErrorMiddleware(ctx: Context, next: Next) {
        try {
            await next()
        }
        catch (error) {
            ctx.status = error.status ?? 500
            ctx.body = error.message
            ctx.app.emit('error', error, ctx)
        }
    }

    return koaErrorMiddleware
}

export function createKoaAppErrorHandler(spec?: RestSpec) {
    const logger = spec?.logger ?? console

    function koaErrorHandler(error: Error, ctx: Context) {
        // ctx is passed only in case of req/res lifecycle errors.
        // Not in case of error status.
        logger.error(error)
    }

    return koaErrorHandler
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RestContainer<C, M> {
    Context?: {
        REST_ADDR?: string
        REST_PORT?: string | number
    }
    Logger?: Logger
    RestSpec?: RestSpec<C, M>
}

export interface RestSpec<C = any, M = any> {
    apiPath?: string
    context?: C
    httpAddr?: string
    httpPort?: string | number
    logger?: Logger
    maxAge?: number
    middleware?: RestMiddleware<M>
    staticDir?: string
}

export type RestMiddleware<C> = Array<RestMiddlewareFactory<C>>
export type RestMiddlewareFactory<C> = (spec?: RestSpec<C, C>) => Routes

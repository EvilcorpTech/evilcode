import {isArray, isFunction, isObject} from '@eviljs/std/type.js'
import type Router from '@koa/router'
import type {Middleware} from '@koa/router'
import {throwInvalidArgument} from '@eviljs/std/throw.js'

export function setupRouter(router: Router, ...routes: Array<Routes>) {
    routes.forEach(it =>
        setupRouterRoutes(router, it)
    )

    return router
}

/*
* Applies routes to a Koa Router.
*
* EXAMPLE
*
* setupRouter(new KoaRouter(), function middleware(ctx, next) {}, ...)
* setupRouter(new KoaRouter(), {method: ['PUT', 'POST'], path: '/path', middleware: functionOrArray}, ...)
* setupRouter(new KoaRouter(), [middleware, {...}, ...], ...)
*/
export function setupRouterRoutes(router: Router, routes?: undefined | Routes) {
    // routes can be:
    // - a function
    // - an object with the structure
    //   {
    //       method: ['GET', 'POST'], // 'ALL' by default.
    //       path: '/path',
    //       middleware: middleware, // Function or array of functions.
    //   }
    // - an array of functions and/or objects.
    if (! routes) {
        return router
    }

    if (isFunction(routes)) {
        router.use(routes)
        return router
    }

    if (isArray(routes)) {
        setupRouter(router, ...routes)
        return router
    }

    if (isObject(routes)) {
        const methods: Array<RouteMethodExt> = [routes.method ?? 'all'].flat()
        const path = routes.path
        const middlewares: Array<Middleware> = [routes.middleware].flat()

        for (const method of methods) {
            const iface = method.toLowerCase() as RouteMethod

            // Something similar to:
            // router.get(path, func1, func2)
            router[iface](path, ...middlewares)
        }

        return router
    }

    return throwInvalidArgument(
        '@eviljs/node-rest/routing.setupRouterRoutes(router, ~~routes~~):\n'
        + `routes must be Function | Array | Object, given "${routes}".`
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export type Routes = Middleware | RouteObject | Array<Middleware | RouteObject>

export interface RouteObject {
    method?: undefined | RouteMethodExt | Array<RouteMethodExt>
    path: string | RegExp
    middleware: Middleware | Array<Middleware>
}

export type RouteMethod = 'all' | 'get' | 'put' | 'post' |'patch' | 'delete'
export type RouteMethodExt = RouteMethod | 'ALL' | 'GET' | 'PUT' | 'POST' |'PATCH' | 'DELETE'

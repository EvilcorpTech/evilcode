import {createReactiveRef} from '@eviljs/std/reactive.js'
import {areSameRoutes, encodeLink, mergeRouteChange, type Router, type RouterOptions, type RouterRouteChangeParams, type RouterRouteParams} from './router.js'

export function createMemoryRouter<S = unknown>(options?: undefined | RouterMemoryOptions<S>): Router<S> {
    let active = false

    const self: Router<S> = {
        route: createReactiveRef({
            path: options?.initialPath ?? '/',
            params: options?.initialParams,
            state: options?.initialState,
        }),
        get started() {
            return active
        },
        start() {
            active = true
        },
        stop() {
            active = false
        },
        changeRoute(routeChange) {
            const nextRoute = mergeRouteChange(self.route.value, routeChange)

            if (areSameRoutes(self.route.value, nextRoute)) {
                return
            }

            self.route.value = nextRoute
        },
        createLink(path: string, params?: undefined | RouterRouteChangeParams) {
            return encodeLink(path, params)
        },
    }

    return self
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterMemoryOptions<S = unknown> extends RouterOptions {
    initialPath?: undefined | string
    initialParams?: undefined | RouterRouteParams
    initialState?: undefined | S
}

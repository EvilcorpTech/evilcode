import {createReactiveRef} from '@eviljs/std/reactive-ref.js'
import {areSameRoutes, decodeRouteParams, encodeLink, mergeRouteChange, type Router, type RouterOptions, type RouterRoute, type RouterRouteChangeParams} from './router.js'
import {asBaseUrl} from './url.js'

export function createPathRouter<S = unknown>(options?: undefined | RouterOptions): Router<S> {
    const basePath = asBaseUrl(options?.basePath)
    let active = false

    function onRouteChange() {
        self.route.value = decodePathRoute(basePath)
    }

    const self: Router<S> = {
        route: createReactiveRef(decodePathRoute(basePath)),

        get started() {
            return active
        },
        start() {
            if (active) {
                return
            }

            active = true
            self.route.value = decodePathRoute(basePath)
            window.addEventListener('popstate', onRouteChange)
        },
        stop() {
            active = false
            window.removeEventListener('popstate', onRouteChange)
        },
        changeRoute(routeChange) {
            const nextRoute = mergeRouteChange(self.route.value, routeChange)

            if (areSameRoutes(self.route.value, nextRoute)) {
                return
            }

            self.route.value = nextRoute

            const routeString = self.createLink(self.route.value.path, self.route.value.params)

            // The History mutation does not trigger the PopState event.
            if (routeChange.replace) {
                history.replaceState(self.route.value.state, '', routeString)
            }
            else {
                history.pushState(self.route.value.state, '', routeString)
            }
        },
        createLink(path: string, params?: undefined | RouterRouteChangeParams) {
            return encodeLink(basePath + path, params)
        },
    }

    return self
}

export function decodePathRoute<S>(basePath: string): RouterRoute<S> {
    const {pathname, search} = window.location
    const path = basePath
        ? pathname.slice(basePath.length) // pathname.replace(basePath, '')
        : pathname
    const params = decodeRouteParams(
        search.substring(1) // Without the initial '?'.
    )
    const {state} = history

    return {path, params, state}
}

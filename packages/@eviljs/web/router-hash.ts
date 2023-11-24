import {createReactiveRef} from '@eviljs/std/reactive.js'
import {areSameRoutes, decodeRouteParams, encodeLink, mergeRouteChange, type Router, type RouterOptions, type RouterRoute, type RouterRouteChangeParams} from './router.js'

export function createHashRouter<S = unknown>(options?: undefined | RouterOptions): Router<S> {
    let active = false

    function onRouteChange() {
        self.route.value = decodeHashRoute()
    }

    const self: Router<S> = {
        route: createReactiveRef(decodeHashRoute()),

        get started() {
            return active
        },
        start() {
            if (active) {
                return
            }

            active = true
            self.route.value = decodeHashRoute()
            window.addEventListener('hashchange', onRouteChange)
        },
        stop() {
            active = false
            window.removeEventListener('hashchange', onRouteChange)
        },
        changeRoute(routeChange) {
            const nextRoute = mergeRouteChange(self.route.value, routeChange)

            if (areSameRoutes(self.route.value, nextRoute)) {
                return
            }

            self.route.value = nextRoute

            const routeString = self.createLink(self.route.value.path, self.route.value.params)

            // The History mutation does not trigger the HashChange event.
            if (routeChange.replace) {
                history.replaceState(self.route.value.state, '', routeString)
            }
            else {
                // Algorithm 1:
                // BEGIN
                history.pushState(self.route.value.state, '', routeString)
                // END

                // // Algorithm 2 (legacy):
                // // BEGIN
                // self.stop()
                // window.location.hash = routeString
                // self.start()
                // // END
            }
        },
        createLink(path: string, params?: undefined | RouterRouteChangeParams) {
            return '#' + encodeLink(path, params)
        },
    }

    return self
}

export function decodeHashRoute<S>(): RouterRoute<S> {
    const {hash} = window.location
    const [pathOptional, paramsString] = hash
        .substring(1) // Without the initial '#'.
        .split('?')
    const path = pathOptional || '/' // The empty string is casted to the root path.
    const params = decodeRouteParams(paramsString)
    const {state} = history

    return {path, params, state}
}

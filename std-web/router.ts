export const RegexpCache: Record<string, RegExp> = {}

export function createRouter(routeHandler: RouteHandler) {
    const self: Router = {
        start() {
            window.addEventListener('hashchange', onHashChange)
        },
        stop() {
            window.removeEventListener('hashchange', onHashChange)
        },
    }

    function onHashChange() {
        const route = readHashRoute()

        routeHandler(route)
    }

    return self
}

export function readHashRoute() {
    return window.location.hash.substring(1)
}

export function routeTo(path: string) {
    window.location.hash = path
}

export function link(path: string) {
    return '#' + path
}

export function isPathRouted(path: string, route: string) {
    if (! RegexpCache[path]) {
        RegexpCache[path] = new RegExp(`^${path}(/|$)`, 'i')
    }

    const re = RegexpCache[path]

    return re.test(route)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Router {
    start(): void
    stop(): void
}

export interface RouteHandler {
    (route: string): void
}
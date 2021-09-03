import {createHashRouter, RouterRouteParams} from '@eviljs/web/router'
import {defineComponent, h, InjectionKey, onMounted, onUnmounted, provide, Ref, ref} from 'vue'
import {DocRoute, HomeRoute} from ':/lib/routes'
import DocPage from './DocPage.vue'
import HomePage from './HomePage.vue'
import NotFoundPage from './NotFoundPage.vue'
import {Cards} from './model'

export const RouteService: InjectionKey<Ref<Route>> = Symbol('RouteService')

export const App = defineComponent({
    setup(props, context) {
        const initialRoute = {path: '/', params: {}, link: () => ''}
        const route = ref<Route>(initialRoute)

        function onRouteChange(path: string, params: RouterRouteParams) {
            route.value = {
                ...route.value,
                path,
                params,
            }
        }

        const router = createHashRouter(onRouteChange, {basePath: '/'})

        route.value = {
            link: router.link,
            path: router.route.path,
            params: router.route.params,
        }

        onMounted(() => {
            router.start()
        })
        onUnmounted(() => {
            router.stop()
        })

        provide(RouteService, route)

        return renderApp.bind(null, route)
    },
})

function renderApp(route: Ref<Route>) {
    const routePath = route.value.path

    if (HomeRoute.pattern.test(routePath)) {
        return h(HomePage)
    }

    if (DocRoute.pattern.test(routePath)) {
        const [id] = routePath.match(DocRoute.pattern)?.slice(1) ?? []
        const page = Cards.find(it => it.id === id)

        if (page) {
            return h(DocPage, {id: page.id})
        }
    }

    return h(NotFoundPage)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Route {
    path: string
    params: RouterRouteParams
    link(path: string, params: RouterRouteParams): string
}

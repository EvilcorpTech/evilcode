import {computedRef} from '@eviljs/std/reactive.js'
import type {Router} from '@eviljs/web/router.js'
import {createRoot} from 'react-dom/client'
import type {AppContext, AppEntriesList} from './adapt-entry.js'
import {createReactHydratedRoot, createReactRenderTask} from './adapt-render.js'
import {RootDefaultId, setupRootElement} from './adapt-root.js'

export async function startApp<C extends object = {}>(args: AdaptOptions<C>) {
    const rootNode = setupRootElement(args.rootElementId ?? RootDefaultId, args.rootElementClasses)
    const shouldHydrate = rootNode.hasChildNodes()
    const router = args.router
    const routePathRef = computedRef([router.route], (route) => route.path)

    const reactRoot = shouldHydrate
        ? await createReactHydratedRoot({...args, rootNode, routePath: routePathRef.value})
        : createRoot(rootNode)

    let currentReactRenderTask: undefined | ReturnType<typeof createReactRenderTask>
    let isFirstRender = true

    router.start()

    routePathRef.watch(routePath => {
        if (shouldHydrate && isFirstRender) {
            // We skip first render in case we already rendered during hydration.
            isFirstRender = false
            return
        }

        isFirstRender = false
        currentReactRenderTask?.cancel()
        currentReactRenderTask = createReactRenderTask({...args, reactRoot, routePath})
    }, {immediate: true})
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AdaptOptions<C extends object = {}> {
    context?: undefined | C
    entries: AppEntriesList<C>
    fallback: (context: AppContext<C>) => JSX.Element | React.ReactNode | Promise<JSX.Element | React.ReactNode>
    rootElementId?: undefined | string
    rootElementClasses?: undefined | Array<string>
    Root?: undefined | React.ComponentType<React.PropsWithChildren>
    router: Router
}

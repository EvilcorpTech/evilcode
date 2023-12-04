import {createComputedRef} from '@eviljs/std/reactive-ref.js'
import type {Router} from '@eviljs/web/router.js'
import {createRoot} from 'react-dom/client'
import type {AppContext, AppEntriesList} from './adapt-entry.js'
import {createReactHydrateTask, createReactRenderTask} from './adapt-render.js'
import {RootDefaultId, setupRootElement} from './adapt-root.js'

export async function startApp<C extends object = {}>(args: AdaptOptions<C>) {
    const {router} = args
    const rootNode = setupRootElement(args.rootElementId ?? RootDefaultId, args.rootElementClasses)
    const shouldHydrate = rootNode.hasChildNodes()
    const reactRoot = createRoot(rootNode)
    const routePathRef = createComputedRef([router.route], route => route.path)
    const initialRoutePath = routePathRef.value

    await shouldHydrate
        ? createReactHydrateTask({...args, reactRoot, routePath: initialRoutePath, rootNode})
        : createReactRenderTask({...args, reactRoot, routePath: initialRoutePath})

    let currentRenderTask: undefined | ReturnType<typeof createReactRenderTask>

    router.start()

    routePathRef.watch(routePath => {
        currentRenderTask?.cancel()
        currentRenderTask = createReactRenderTask({...args, reactRoot, routePath})
    })
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

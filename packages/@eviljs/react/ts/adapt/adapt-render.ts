import type {Task} from '@eviljs/std/fn-type'
import {watchReactive} from '@eviljs/std/reactive'
import {createReactiveComputed} from '@eviljs/std/reactive-compute'
import {isIterator} from '@eviljs/std/type-is'
import type {Router} from '@eviljs/web/router'
import {createElement, startTransition} from 'react'
import {createRoot, type Root as ReactRoot} from 'react-dom/client'
import {computeAppEntryResult, selectAppEntryMatch, type AppContext, type AppEntriesList, type AppEntryGenerator} from './adapt-entry.js'
import {RootDefaultId, setupRootElement} from './adapt-root.js'

export async function startApp<C extends object = object>(args: AdaptAppOptions<C>): Promise<{
    root: ReactRoot
    clean: Task
    stop: Task
}> {
    const {router} = args
    const rootNode = setupRootElement(args.rootElementId ?? RootDefaultId, args.rootElementClasses)
    const routePathComputed = createReactiveComputed([router.route], route => route.path)
    const initialRoutePath = routePathComputed.value

    const reactRoot = await mountAppRoot({...args as AdaptAppOptions<any>, rootNode, routePath: initialRoutePath})

    let currentRenderTask: undefined | ReturnType<typeof runAppRenderTask>

    router.start()

    const stopWatching = watchReactive(routePathComputed, routePath => {
        currentRenderTask?.cancel()
        currentRenderTask = runAppRenderTask({...args as AdaptAppOptions<any>, rootNode, reactRoot, routePath})
    })

    function stop() {
        stopWatching()
    }

    function clean() {
        stopWatching()
        reactRoot.unmount()
    }

    return {root: reactRoot, clean: clean, stop: stop}
}

export async function mountAppRoot(args: AdaptHydratedRootOptions): Promise<ReactRoot> {
    const {rootNode} = args
    const shouldHydrate = rootNode.hasChildNodes()

    return shouldHydrate
        ? createAppHydratedRoot(args)
        : createAppMountedRoot(args)
}

export async function createAppHydratedRoot(args: AdaptHydratedRootOptions): Promise<ReactRoot> {
    const {context, fallback, entries, RootComponent, rootNode, routePath} = args
    const [routePathArgs, appEntryDefinition] = selectAppEntryMatch(routePath, entries) ?? []
    const appContext: AppContext = {...context, routePath, routePathArgs}

    async function loadAppEntryResult() {
        if (! routePathArgs || ! appEntryDefinition) {
            return fallback(appContext)
        }

        const appEntry = await appEntryDefinition.entryLoader()
        return computeAppEntryResult(appEntry, appContext)
    }

    const appChildren = await loadAppEntryResult().catch(error => void console.error(error))
    const reactRoot = createRoot(rootNode)
    // return hydrateRoot(rootNode, createAppRootElement({Root: Root, children: appChildren}))

    startTransition(() => {
        reactRoot.render(createAppRootElement({RootComponent, children: appChildren}))
    })

    return reactRoot
}

export async function createAppMountedRoot(args: AdaptMountedRootOptions): Promise<ReactRoot> {
    const {rootNode} = args

    const reactRoot = createRoot(rootNode)

    await runAppRenderTask({...args, reactRoot})

    return reactRoot
}

export function runAppRenderTask(args: AdaptRenderTaskOptions): {
    cancel(): void
    promise: Promise<void>
} {
    const {context, fallback, entries, reactRoot, RootComponent, routePath} = args

    let canceled = false

    async function render(): Promise<void> {
        const [routePathArgs, appEntryDefinition] = selectAppEntryMatch(routePath, entries) ?? []

        if (! routePathArgs || ! appEntryDefinition) {
            const appContext: AppContext = {...context, routePath, routePathArgs: undefined}
            const appChildren = await fallback(appContext)
            renderReactRoot(createAppRootElement({RootComponent, children: appChildren}))
            return
        }

        const appEntry = await appEntryDefinition.entryLoader()
        const appContext: AppContext = {...context, routePath, routePathArgs}

        await renderGenerator(appEntry(appContext))
    }

    async function renderGenerator(generator: AppEntryGenerator): Promise<void> {
        while (true) {
            const it = await generator.next()

            if (canceled) {
                return
            }
            if (! it.done) {
                renderReactRoot(it.value)
                continue
            }
            if (it.done && ! isIterator(it.value)) {
                renderReactRoot(it.value)
                return
            }
            if (it.done && isIterator(it.value)) {
                await renderGenerator(it.value)
                return
            }
        }
    }

    function renderReactRoot(children: JSX.Element | React.ReactNode): void {
        if (canceled) {
            return
        }

        startTransition(() => {
            reactRoot.render(createAppRootElement({RootComponent, children: children}))
        })
    }

    const promise = render().catch(console.error)

    function onCancel() {
        canceled = true
    }

    return {cancel: onCancel, promise}
}

export function createAppRootElement(args: AdaptAppRootOptions): JSX.Element | React.ReactNode {
    const {RootComponent, children} = args

    return RootComponent
        ? createElement(RootComponent, {children: children})
        : children
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AdaptAppOptions<C extends object = object> {
    context?: undefined | C
    entries: AppEntriesList<object, C>
    fallback: (context: AppContext<C>) => JSX.Element | React.ReactNode | Promise<JSX.Element | React.ReactNode>
    rootElementId?: undefined | string
    rootElementClasses?: undefined | Array<string>
    RootComponent?: undefined | React.ComponentType<React.PropsWithChildren>
    router: Router
}

export interface AdaptHydratedRootOptions extends AdaptAppOptions {
    rootNode: HTMLElement
    routePath: string
}

export interface AdaptMountedRootOptions extends AdaptHydratedRootOptions {
}

export interface AdaptRenderTaskOptions extends AdaptMountedRootOptions {
    reactRoot: ReactRoot
}

export interface AdaptAppRootOptions extends Pick<AdaptAppOptions, 'RootComponent'> {
    children: JSX.Element | React.ReactNode
}

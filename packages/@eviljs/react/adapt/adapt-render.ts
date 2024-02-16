import {isIterator} from '@eviljs/std/type.js'
import {createElement} from 'react'
import type {Root as ReactRoot} from 'react-dom/client'
import {createRoot} from 'react-dom/client'
import type {AdaptOptions} from './adapt-boot.js'
import {computeAppEntryResult, selectAppEntryMatch, type AppContext, type AppEntryGenerator} from './adapt-entry.js'

export async function createReactHydrateTask<C extends object = {}>(args: AdaptHydrateTaskOptions<C>): Promise<ReactRoot> {
    const {context, fallback, entries, Root, rootNode, routePath} = args

    const [routePathArgs, appEntryDefinition] = selectAppEntryMatch(routePath, entries) ?? []
    const appContext: AppContext<C> = {...context as C, routePath, routePathArgs}

    const appChildren = await (async () => {
        if (! routePathArgs || ! appEntryDefinition) {
            return fallback(appContext)
        }
        const appEntry = await appEntryDefinition.entryLoader()
        return computeAppEntryResult(appEntry, appContext)
    })().catch(error => void console.error(error))

    const reactRoot = createRoot(rootNode)
    reactRoot.render(
        Root
            ? createElement(Root, {children: appChildren})
            : appChildren
        ,
    )
    return reactRoot

    // return hydrateRoot(rootNode,
    //     Root
    //         ? createElement(Root, {children: appChildren})
    //         : appChildren
    //     ,
    // )
}

export async function createReactMountTask<C extends object = {}>(args: AdaptMountTaskOptions<C>): Promise<ReactRoot> {
    const {rootNode} = args

    const reactRoot = createRoot(rootNode)

    await createReactRenderTask({...args, reactRoot})

    return reactRoot
}

export function createReactRenderTask<C extends object = {}>(args: AdaptRenderTaskOptions<C>) {
    const {context, fallback, entries, reactRoot, Root, routePath} = args

    let canceled = false

    async function render(): Promise<void> {
        const [routePathArgs, appEntryDefinition] = selectAppEntryMatch(routePath, entries) ?? []

        if (! routePathArgs || ! appEntryDefinition) {
            await renderFallback()
            return
        }

        const appEntry = await appEntryDefinition.entryLoader()
        const appContext: AppContext<C> = {...context as C, routePath, routePathArgs}
        const appEntryGenerator = appEntry(appContext)

        await renderGenerator(appEntryGenerator)
    }

    async function renderGenerator(generator: AppEntryGenerator): Promise<void> {
        while (true) {
            const it = await generator.next()

            if (canceled) {
                return
            }
            if (it.done && isIterator(it.value)) {
                return renderGenerator(it.value)
            }
            if (it.done && ! isIterator(it.value)) {
                return renderReactRoot(it.value)
            }

            if (! it.done) {
                renderReactRoot(it.value)
            }
        }
    }

    function renderReactRoot(children: JSX.Element | React.ReactNode): void {
        if (canceled) {
            return
        }

        reactRoot.render(
            Root
                ? createElement(Root, {children})
                : children
            ,
        )
    }

    async function renderFallback(): Promise<void> {
        const appContext: AppContext<C> = {...context as C, routePath, routePathArgs: undefined}
        const appChildren = await fallback(appContext)

        if (canceled) {
            return
        }

        reactRoot.render(
            Root
                ? createElement(Root, {children: appChildren})
                : appChildren
            ,
        )
    }

    const promise = render().catch(console.error)

    function onCancel() {
        canceled = true
    }

    return {cancel: onCancel, promise}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AdaptHydrateTaskOptions<C extends object = {}> extends AdaptOptions<C> {
    rootNode: HTMLElement
    routePath: string
}

export interface AdaptMountTaskOptions<C extends object = {}> extends AdaptHydrateTaskOptions<C> {
}

export interface AdaptRenderTaskOptions<C extends object = {}> extends AdaptMountTaskOptions<C> {
    reactRoot: ReactRoot
}

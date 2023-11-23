import {isIterator} from '@eviljs/std/type.js'
import {createElement} from 'react'
import {hydrateRoot, type Root as ReactRoot} from 'react-dom/client'
import type {AdaptOptions} from './adapt-boot.js'
import {computeGeneratorResult, selectAppEntryMatch, type AppContext, type AppEntryGenerator} from './adapt-entry.js'

export async function createReactHydratedRoot<C extends object = {}>(args: AdaptHydratedTaskOptions<C>): Promise<ReactRoot> {
    const {context, fallback, entries, Root, routePath} = args

    const [routePathArgs, loadSelectedAppEntry] = selectAppEntryMatch(routePath, entries) ?? []
    const appContext: AppContext<C> = {...context as C, routePath, routePathArgs}

    const appChildren = await (async () => {
        if (! loadSelectedAppEntry) {
            return fallback(appContext)
        }
        const appEntry = await loadSelectedAppEntry()
        return computeGeneratorResult(appEntry(appContext))
    })().catch(error => void console.error(error))

    return hydrateRoot(
        args.rootNode,
        Root
            ? createElement(Root, {children: appChildren})
            : appChildren
        ,
    )
}

export function createReactRenderTask<C extends object = {}>(args: AdaptRenderTaskOptions<C>) {
    const {context, fallback, entries, reactRoot, Root, routePath} = args

    let canceled = false

    async function render() {
        const selectedAppEntry = selectAppEntryMatch(routePath, entries)

        if (! selectedAppEntry) {
            await renderFallback()
            return
        }

        const [routePathArgs, loadSelectedAppEntry] = selectedAppEntry
        const appContext: AppContext<C> = {...context as C, routePath, routePathArgs}
        const appEntry = await loadSelectedAppEntry()
        const appEntryGenerator = appEntry(appContext)

        await renderGenerator(appEntryGenerator)
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

            if (isIterator(it.value)) {
                return renderGenerator(it.value)
            }

            return renderReactRoot(it.value)
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

    async function renderFallback() {
        const appContext: AppContext<C> = {...context as C, routePath, routePathArgs: undefined}
        const appChildren = await fallback(appContext)

        if (canceled) {
            return
        }

        reactRoot.render(Root
            ? createElement(Root, {children: appChildren})
            : appChildren
        )
    }

    const promise = render().catch(console.error)

    function onCancel() {
        canceled = true
    }

    return {cancel: onCancel, promise}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AdaptRenderTaskOptions<C extends object = {}> extends AdaptOptions<C> {
    reactRoot: ReactRoot
    routePath: string
}

export interface AdaptHydratedTaskOptions<C extends object = {}> extends AdaptOptions<C> {
    rootNode: HTMLElement
    routePath: string
}

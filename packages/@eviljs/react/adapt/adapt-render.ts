import {createElement} from 'react'
import {hydrateRoot, type Root as ReactRoot} from 'react-dom/client'
import type {AdaptOptions} from './adapt-boot.js'
import {computeAppEntryResult, selectAppEntryMatch, type AppContext} from './adapt-entry.js'

export async function createReactHydratedRoot<C extends object = {}>(args: AdaptHydratedTaskOptions<C>): Promise<ReactRoot> {
    const {context, fallback, entries, Root, routePath} = args

    const [routePathArgs, loadSelectedAppEntry] = selectAppEntryMatch(routePath, entries) ?? []
    const appContext: AppContext<C> = {...context as C, routePath, routePathArgs}

    const appChildren = await (async () => {
        if (! loadSelectedAppEntry) {
            return fallback(appContext)
        }
        const appEntry = await loadSelectedAppEntry()
        return computeAppEntryResult(appContext, appEntry)
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
        const generator = appEntry(appContext)

        while (true) {
            const it = await generator.next()

            const appChildren = it.value // Last value is the return value.

            if (canceled) {
                return
            }

            reactRoot.render(
                Root
                    ? createElement(Root, {children: appChildren})
                    : appChildren
                ,
            )

            if (it.done) {
                return
            }
        }
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

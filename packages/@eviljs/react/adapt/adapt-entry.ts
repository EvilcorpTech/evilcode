import type {Task} from '@eviljs/std/fn.js'
import {memoizing} from '@eviljs/std/memo.js'
import {selectRouteMatch, type RoutePathTest} from '@eviljs/web/route.js'

export function defineAppEntryLoader<C extends object = {}>(loader: Task<Promise<AppEntry<C>>>): Task<Promise<AppEntry<C>>> {
    return memoizing(() => loader())
}

export function selectAppEntryMatch<C extends object = {}>(
    routePath: string,
    entries: AppEntriesList<C>,
): undefined | [RegExpMatchArray, Task<Promise<AppEntry<C>>>] {
    const [routePathMatches, loadEntry] = selectRouteMatch(routePath, entries) ?? []

    if (! routePathMatches || ! loadEntry) {
        return
    }

    return [routePathMatches, loadEntry]
}

export async function computeAppEntryResult<C extends object = {}>(
    context: AppContext<C>,
    entry: AppEntry<C>,
): Promise<React.ReactNode> {
    const generator = entry(context)

    while (true) {
        const it = await generator.next()

        if (it.done) {
            return it.value // The return value of the generator.
        }
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export type AppContext<C extends object = {}> = {
    routePath: string
    routePathArgs: undefined | RegExpMatchArray
} & C

export type AppEntry<C extends object = {}> = (context: AppContext<C>) => AsyncGenerator<
    JSX.Element | React.ReactNode, JSX.Element | React.ReactNode, void
>

export type AppEntriesDefinition<C extends object = {}> = Record<string, {
    route: RoutePathTest
    loader: Task<Promise<AppEntry<C>>>
}>

export type AppEntriesList<C extends object = {}> = Array<[RoutePathTest, Task<Promise<AppEntry<C>>>]>

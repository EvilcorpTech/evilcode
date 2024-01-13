import type {Task} from '@eviljs/std/fn.js'
import {memoizing} from '@eviljs/std/memo.js'
import {isIterator} from '@eviljs/std/type.js'
import {selectRouteMatch, type RoutePatterns} from '@eviljs/web/route.js'

export function defineAppEntry<C extends object = {}>(loader: Task<Promise<AppEntry<C>>>): Task<Promise<AppEntry<C>>> {
    return memoizing(loader)
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

export function computeAppEntryResult<C extends object = {}>(
    entry: AppEntry<C>,
    context: AppContext<C>,
): Promise<React.ReactNode> {
    return computeGeneratorResult(entry(context))
}

export async function computeGeneratorResult(generator: AppEntryGenerator): Promise<React.ReactNode> {
    while (true) {
        const it = await generator.next()

        if (! it.done) {
            continue
        }

        return isIterator(it.value)
            ? computeGeneratorResult(it.value)
            : it.value // The return value of the generator.
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export type AppContext<C extends object = {}> = {
    routePath: string
    routePathArgs: undefined | RegExpMatchArray
} & C

export type AppEntry<C extends object = {}> = (context: AppContext<C>) => AppEntryGenerator

export type AppEntryGenerator = AsyncGenerator<AppEntryYield, AppEntryReturn, void>
export type AppEntryOutput = JSX.Element | React.ReactNode
export type AppEntryYield = AppEntryOutput
export type AppEntryReturn = AppEntryOutput | AsyncGenerator<AppEntryOutput, AppEntryOutput, void>

export type AppEntriesDefinition<C extends object = {}> = Record<string, {
    entry: Task<Promise<AppEntry<C>>>
    route: RoutePatterns
}>

export type AppEntriesList<C extends object = {}> = Array<[RoutePatterns, Task<Promise<AppEntry<C>>>]>

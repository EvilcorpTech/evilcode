import {memoizing, type Task} from '@eviljs/std/fn.js'
import {isIterator} from '@eviljs/std/type.js'
import {selectRouteMatch, type RoutePatterns} from '@eviljs/web/route.js'

export function defineAppEntry<C extends object = {}>(loader: Task<Promise<AppEntry<C>>>): AppEntryLoader<C> {
    return memoizing(loader)
}

export function selectAppEntryMatch<C extends object = {}>(
    routePath: string,
    entriesList: AppEntriesList<C>,
): undefined | [RegExpMatchArray, AppEntryDefinition<C>] {
    const routeMatches = entriesList.map((it): [RoutePatterns, AppEntryDefinition<C>] => [it.routePatterns, it])
    const [routePathMatches, entryDefinition] = selectRouteMatch(routePath, routeMatches) ?? []

    if (! routePathMatches || ! entryDefinition) {
        return
    }

    return [routePathMatches, entryDefinition]
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

export type AppEntryDefinition<C extends object = {}, O extends object = {}> = {
    routePatterns: RoutePatterns
    entryLoader: AppEntryLoader<C>
} & O

export type AppEntry<C extends object = {}> = (context: AppContext<C>) => AppEntryGenerator
export type AppEntryLoader<C extends object = {}> = Task<Promise<AppEntry<C>>>
export type AppEntryGenerator = AsyncGenerator<AppEntryYield, AppEntryReturn, void>
export type AppEntryOutput = JSX.Element | React.ReactNode
export type AppEntryYield = AppEntryOutput
export type AppEntryReturn = AppEntryOutput | AsyncGenerator<AppEntryOutput, AppEntryOutput, void>

export type AppEntriesList<C extends object = {}, O extends object = {}> = Array<AppEntryDefinition<C, O>>

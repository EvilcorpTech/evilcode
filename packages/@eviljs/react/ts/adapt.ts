export type {RoutePatterns} from '@eviljs/web/route'
export {startApp} from './adapt/adapt-boot.js'
export type {AdaptOptions} from './adapt/adapt-boot.js'
export {
    computeAppEntryResult,
    computeGeneratorResult,
    defineAppEntry,
    selectAppEntryMatch
} from './adapt/adapt-entry.js'
export type {
    AppContext,
    AppEntriesList,
    AppEntry,
    AppEntryDefinition,
    AppEntryGenerator,
    AppEntryLoader,
    AppEntryOutput,
    AppEntryReturn,
    AppEntryYield
} from './adapt/adapt-entry.js'

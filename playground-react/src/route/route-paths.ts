import {MatchArg as Arg, exact} from '@eviljs/web/route'
import {defineRoutePath} from '@eviljs/web/route-v2'
import {matchBasePath} from '~/route/route-apis'

export const RouteBase = {
    Showcase: {
        En: '/en/showcase',
        It: '/it/showcase',
    },
    Example: {
        En: '/en/example',
        It: '/it/example',
    },
}

export const RoutePath = {
    Home: defineRoutePath({
        patterns: [
            exact`/`,
            exact`/en`,
            exact`/it`,
        ],
        encode(locale: string) {
            return `/${locale}`
        },
    }),
    Showcase: defineRoutePath({
        patterns: [
            exact`${RouteBase.Showcase.En}`,
            exact`${RouteBase.Showcase.It}`,
        ],
        encode(locale: string) {
            switch (locale) {
                case 'en': return `${RouteBase.Showcase.En}`
                default: return `${RouteBase.Showcase.It}`
            }
        },
    }),
    ExampleWithArg: defineRoutePath({
        patterns: [
            exact`${RouteBase.Example.En}/${Arg}`,
            exact`${RouteBase.Example.It}/${Arg}`,
        ],
        encode(locale: string, id: string) {
            switch (locale) {
                case 'en': return `${RouteBase.Example.En}/${id}`
                default: return `${RouteBase.Example.It}/${id}`
            }
        },
    }),
}

export const RoutePathBase = {
    Showcase: Object.values(RouteBase.Showcase).map(matchBasePath),
    Example: Object.values(RouteBase.Example).map(matchBasePath),
}

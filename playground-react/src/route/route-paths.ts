import {MatchArg as Arg, exact} from '@eviljs/web/route'
import {defineRoutePath} from '@eviljs/web/route-v2'
import {matchBasePath} from '~/route/route-apis'

export const RouteBase = {
    Admin: {
        En: '/en/admin',
        It: '/it/admin',
    },
    Auth: {
        En: '/auth',
        It: '/auth',
    },
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
    Admin: defineRoutePath({
        patterns: [
            exact`${RouteBase.Admin.En}`,
            exact`${RouteBase.Admin.It}`,
        ],
        encode(locale: string) {
            switch (locale) {
                case 'en': return `${RouteBase.Admin.En}`
                default: return `${RouteBase.Admin.It}`
            }
        },
    }),
    Auth: defineRoutePath({
        patterns: [
            exact`${RouteBase.Auth.En}`,
            exact`${RouteBase.Auth.It}`,
        ],
        encode(locale: string) {
            switch (locale) {
                case 'en': return `${RouteBase.Auth.En}`
                default: return `${RouteBase.Auth.It}`
            }
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
    Admin: Object.values(RouteBase.Admin).map(matchBasePath),
    Auth: Object.values(RouteBase.Auth).map(matchBasePath),
    Showcase: Object.values(RouteBase.Showcase).map(matchBasePath),
    Example: Object.values(RouteBase.Example).map(matchBasePath),
}

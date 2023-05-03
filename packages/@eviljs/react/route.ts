import {
    RoutePathPlaceholder,
    replaceAllRoutePatternPlaceholders,
    replaceRoutePatternPlaceholders,
    type RoutePath,
    type RoutePatternArgs,
} from '@eviljs/web/route-v2.js'
import {useMemo} from 'react'
import {useI18n} from './i18n.js'
import {joinUrlPath} from './request.js'
import {Arg, exact} from './router.js'

export function useRoutePath<A extends RoutePatternArgs>(routeSpec: RoutePath<A>): RouteManager<A> {
    const {locale, fallbackLocale} = useI18n()!

    return useRoutePathBuilder(locale, fallbackLocale, routeSpec)
}

export function useRoutePathBuilder<A extends RoutePatternArgs>(
    locale: string,
    fallbackLocale: string,
    routeSpec: RoutePath<A>,
): RouteManager<A> {
    const route = useMemo((): RouteManager<A> => {
        const patterns = Object.entries(routeSpec.paths).map(it => {
            const [locale, patternsWithPlaceholders] = it

            const patterns = patternsWithPlaceholders.map(it => {
                const pattern = replaceAllRoutePatternPlaceholders(it, RoutePathPlaceholder, Arg)

                return exact(joinUrlPath('/', locale, pattern))
            })

            return patterns
        }).flat()

        return {
            patterns,
            path(...args) {
                const candidates: Array<[string, undefined | Array<string>]> = [
                    [locale, routeSpec.paths[locale]],
                    [fallbackLocale, routeSpec.paths[fallbackLocale]],
                ]

                for (const it of candidates) {
                    const [locale, patternsWithPlaceholders] = it

                    if (! patternsWithPlaceholders) {
                        continue
                    }

                    // First one is the default one.
                    const patternWithPlaceholders = patternsWithPlaceholders[0]

                    if (! patternWithPlaceholders) {
                        continue
                    }

                    const path = replaceRoutePatternPlaceholders(patternWithPlaceholders, RoutePathPlaceholder, args)

                    return joinUrlPath('/', locale, path)
                }

                return ''
            },
        }
    }, [routeSpec, locale, fallbackLocale])

    return route
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouteManager<A extends RoutePatternArgs> {
    patterns: Array<string>
    path(...args: A): string
}

import {asNumber} from '@eviljs/std/type'
import {defineRouteParam} from '@eviljs/web/route-v2'
import {createPageAnchorId} from '~/page/page-anchor-apis'

export const RouteParam = {
    Auth_redirect: defineRouteParam({
        name: 'redirect',
        encode(redirectUrl: string) {
            return {
                [this]: redirectUrl,
            }
        },
        decode(params): undefined | string {
            return params?.[this]
        },
    }),
    CookieSettings: defineRouteParam({
        name: 'cookies!',
        encode(show: boolean) {
            return {
                [this]: show ? null : undefined,
            }
        },
        decode(params): boolean {
            return this in (params ?? {})
        },
    }),
    ChatModal: defineRouteParam({
        name: 'chat!',
        encode(show: boolean) {
            return {
                [this]: show ? null : undefined,
            }
        },
        decode(params): boolean {
            return this in (params ?? {})
        },
    }),
    Products_search: defineRouteParam({
        name: 'search-product',
        encode(search: string) {
            return {
                [this]: encodeURIComponent(search),
            }
        },
        decode(params): undefined | unknown {
            const value = params?.[this]
            return value ? decodeURIComponent(value) : value
        },
    }),
    Products_paginationPage: defineRouteParam({
        name: 'page',
        encode(page: number) {
            return {
                [this]: page,
            }
        },
        decode(params): undefined | number {
            return asNumber(params?.[this])
        },
    }),
    PageAnchor: defineRouteParam({
        name: 'anchor',
        encode(id: string) {
            return {
                [this]: createPageAnchorId(id),
            }
        },
        decode(params): undefined | string {
            return params?.[this]
        },
    }),
}

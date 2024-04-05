import {asNumber} from '@eviljs/std/type'
import {defineRouteParamCodec} from '@eviljs/web/route-v2'
import {createPageAnchorId} from '~/page/page-anchor-apis'

export const RouteParam = {
    Auth_redirect: defineRouteParamCodec({
        name: 'redirect',
        encode(redirectUrl: string) {
            return redirectUrl
        },
        decode(value): undefined | string {
            return value
        },
    }),
    CookieSettings: defineRouteParamCodec({
        name: 'cookies!',
        encode(show: boolean) {
            return show ? null : undefined
        },
        decode(value): boolean {
            return true
        },
    }),
    ChatModal: defineRouteParamCodec({
        name: 'chat!',
        encode(show: boolean) {
            return show ? null : undefined
        },
        decode(value): boolean {
            return true
        },
    }),
    Products_search: defineRouteParamCodec({
        name: 'search-product',
        encode(search: string) {
            return encodeURIComponent(search)
        },
        decode(value): undefined | unknown {
            return value ? decodeURIComponent(value) : value
        },
    }),
    Products_paginationPage: defineRouteParamCodec({
        name: 'page',
        encode(page: number) {
            return page
        },
        decode(value): undefined | number {
            return asNumber(value)
        },
    }),
    PageAnchor: defineRouteParamCodec({
        name: 'anchor',
        encode(id: string) {
            return createPageAnchorId(id)
        },
        decode(value): undefined | string {
            return value
        },
    }),
}

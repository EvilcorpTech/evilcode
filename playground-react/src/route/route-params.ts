import {asNumber} from '@eviljs/std/type'
import {defineRouteParam} from '@eviljs/web/route-param'
import {createPageAnchorId} from '~/page/page-anchor-apis'

export const RouteParam = {
    Auth_redirect: defineRouteParam(
        'redirect',
        (redirectUrl: string) => {
            return redirectUrl
        },
        (value): undefined | string => {
            return value
        },
    ),
    CookieSettings: defineRouteParam(
        'cookies!',
        (show: boolean) => {
            return show ? null : undefined
        },
        (value): boolean => {
            return true
        },
    ),
    ChatModal: defineRouteParam(
        'chat!',
        (show: boolean) => {
            return show ? null : undefined
        },
        (value): boolean => {
            return true
        },
    ),
    Products_search: defineRouteParam(
        'search-product',
        (search: string) => {
            return encodeURIComponent(search)
        },
        (value): undefined | string => {
            return value ? decodeURIComponent(value) : value
        },
    ),
    Products_paginationPage: defineRouteParam(
        'page',
        (page: number) => {
            return page
        },
        (value): undefined | number => {
            return asNumber(value)
        },
    ),
    PageAnchor: defineRouteParam(
        'anchor',
        (id: string) => {
            return createPageAnchorId(id)
        },
        (value): undefined | string => {
            return value
        },
    ),
}

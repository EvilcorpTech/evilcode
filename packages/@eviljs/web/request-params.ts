import type {Io} from '@eviljs/std/fn.js'
import {encodeUrlParams, type UrlParams, type UrlParamsEncodeOptions} from './url-params.js'
import {joinUrlPathAndParams} from './url.js'

/**
* @throws TypeError
**/
export function usingRequestParams(...paramsList: Array<UrlParams>): Io<Request, Request> {
    return (request: Request) => useRequestParams(request, paramsList)
}

/**
* @throws TypeError
**/
export function useRequestParams(request: Request, params: UrlParams, options?: undefined | UrlParamsEncodeOptions): Request {
    const paramsUrl = encodeUrlParams(params, options)
    const url = joinUrlPathAndParams(request.url, paramsUrl)
    return new Request(url, request)
}

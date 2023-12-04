import type {Io} from '@eviljs/std/fn.js'
import {pipingRequest} from './request.js'
import {encodeUrlParams, type UrlParams} from './url-params.js'
import {joinUrlPathAndParams} from './url.js'

/**
* @throws TypeError
**/
export function usingRequestParams(...paramsList: Array<UrlParams>): Io<Request, Request> {
    return pipingRequest(request => useRequestParams(request, paramsList))
}

/**
* @throws TypeError
**/
export function useRequestParams(request: Request, ...paramsList: Array<UrlParams>): Request {
    const paramsUrl = encodeUrlParams(paramsList)
    const url = joinUrlPathAndParams(request.url, paramsUrl)
    return new Request(url, request)
}

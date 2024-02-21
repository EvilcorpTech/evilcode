import {piping} from '@eviljs/std/fn.js'
import {RequestMethod, createRequest, type RequestOptions} from './request.js'

export function creatingRequestDelete(pathOrUrl: string, options?: undefined | RequestOptions) {
    return piping(createRequestDelete(pathOrUrl, options))
}
export function createRequestDelete(pathOrUrl: string, options?: undefined | RequestOptions) {
    return createRequest(RequestMethod.Delete, pathOrUrl, options)
}

export function creatingRequestGet(pathOrUrl: string, options?: undefined | RequestOptions) {
    return piping(createRequestGet(pathOrUrl, options))
}
export function createRequestGet(pathOrUrl: string, options?: undefined | RequestOptions) {
    return createRequest(RequestMethod.Get, pathOrUrl, options)
}

export function creatingRequestPatch(pathOrUrl: string, options?: undefined | RequestOptions) {
    return piping(createRequestPatch(pathOrUrl, options))
}
export function createRequestPatch(pathOrUrl: string, options?: undefined | RequestOptions) {
    return createRequest(RequestMethod.Patch, pathOrUrl, options)
}

export function creatingRequestPost(pathOrUrl: string, options?: undefined | RequestOptions) {
    return piping(createRequestPost(pathOrUrl, options))
}
export function createRequestPost(pathOrUrl: string, options?: undefined | RequestOptions) {
    return createRequest(RequestMethod.Post, pathOrUrl, options)
}

export function creatingRequestPut(pathOrUrl: string, options?: undefined | RequestOptions) {
    return piping(createRequestPut(pathOrUrl, options))
}
export function createRequestPut(pathOrUrl: string, options?: undefined | RequestOptions) {
    return createRequest(RequestMethod.Put, pathOrUrl, options)
}

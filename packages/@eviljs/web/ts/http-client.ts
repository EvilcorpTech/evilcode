import {awaiting, mapSome} from '@eviljs/std/fn-monad'
import {piping} from '@eviljs/std/fn-pipe'
import {identity} from '@eviljs/std/fn-return'
import type {Io} from '@eviljs/std/fn-type'
import {isDefined, isString} from '@eviljs/std/type-is'
import {usingRequestAuthorization} from './request-auth.js'
import {useRequestBody, usingRequestHeaders} from './request-init.js'
import {useRequestJson} from './request-json.js'
import {RequestMethod, creatingRequest, type RequestMethodEnum} from './request-method.js'
import {usingRequestParams} from './request-params.js'
import {usingRequestRetry, type RequestRetryOptions} from './request-retry.js'
import {decodeResponseBody, rejectOnResponseError} from './response.js'
import type {UrlParams} from './url-params.js'

export const HttpClient = {
    Request<O = Response>(args: HttpClientBaseOptions<Response, O>): Promise<NoInfer<O>> {
        const {authToken, baseUrl, body, decoder, encoder, headers, method, params, retry, url} = args

        return creatingRequest(method, url, {baseUrl})
            (authToken ? usingRequestAuthorization('Bearer', authToken) : identity)
            (headers ? usingRequestHeaders(headers) : identity)
            (params ? usingRequestParams(params) : identity)
            (usingRequestPayload(body))
            (encoder ? encoder : identity)
            (usingRequestRetry(retry))
            (decoder ? awaiting(decoder) : (identity as Io<Promise<Response>, Promise<O>>))
        ()
    },
    Get<O = Response>(args: HttpClientGetOptions<Response, O>): Promise<NoInfer<O>> {
        return HttpClient.Request({
            ...args,
            method: RequestMethod.Get,
        })
    },
    Delete<O = Response>(args: HttpClientDeleteOptions<Response, O>): Promise<NoInfer<O>> {
        return HttpClient.Request({
            ...args,
            method: RequestMethod.Delete,
        })
    },
    Patch<O = Response>(args: HttpClientPatchOptions<Response, O>): Promise<NoInfer<O>> {
        return HttpClient.Request({
            ...args,
            method: RequestMethod.Patch,
        })
    },
    Put<O = Response>(args: HttpClientPutOptions<Response, O>): Promise<NoInfer<O>> {
        return HttpClient.Request({
            ...args,
            method: RequestMethod.Put,
        })
    },
    Post<O = Response>(args: HttpClientPostOptions<Response, O>): Promise<NoInfer<O>> {
        return HttpClient.Request({
            ...args,
            method: RequestMethod.Post,
        })
    },
}

/**
* @throws
**/
export function usingRequestPayload(body: undefined | BodyInit | unknown): Io<Request, Request> {
    return (request: Request) => useRequestPayload(request, body)
}

/**
* @throws
**/
export function useRequestPayload(request: Request, body: undefined | BodyInit | unknown): Request {
    if (! isDefined(body)) {
        return request
    }
    if (isString(body)) {
        // Serialization is already handled.
        return useRequestBody(request, body)
    }
    if (body instanceof ArrayBuffer) {
        return useRequestBody(request, body)
    }
    if (body instanceof Blob) {
        return useRequestBody(request, body)
    }
    if (body instanceof FormData) {
        return useRequestBody(request, body)
    }
    if (body instanceof ReadableStream) {
        return useRequestBody(request, body)
    }
    if (body instanceof URLSearchParams) {
        return useRequestBody(request, body)
    }
    // At this point body should be JSON serializable.
    return useRequestJson(request, body)
}

export function createResponseDecoder(): Io<Response | Promise<Response>, Promise<unknown>>
export function createResponseDecoder<O>(contentDecoder: Io<unknown, O | Promise<O>>): Io<Response | Promise<Response>, Promise<O>>
export function createResponseDecoder<O>(contentDecoder?: undefined | Io<unknown, O | Promise<O>>): Io<Response | Promise<Response>, Promise<unknown | O>> {
    function decode(responsePromise: Response | Promise<Response>): Promise<unknown | O> {
        return decodeResponseOrReject(responsePromise, contentDecoder ?? identity)
    }

    return decode
}

export async function decodeResponseOrReject<O>(
    responsePromise: Response | Promise<Response>,
    decodeContent: Io<unknown, O | Promise<O>>,
): Promise<O> {
    return piping(responsePromise)
        (rejectOnResponseError) // Rejects on failed response (4xx/5xx).
        (decodeResponseBody) // Decodes response to FormData/JSON/Text/UrlSearchParams.
        (awaiting(decodeContent)) // Decodes the mixed unsafe output.
    ()
}

/**
* This function can be used to cast an `unknown` input to an `Unsafe<?>` input.
* The condition `unknown extends I ? O : unknown` ensures that this function
* can't be used to cast a known value (for example `Response`) to a different
* value (for example `Unsafe<?>`).
*/
export function castingUnknown<O>(fn: Io<any, O>): (<I>(input: I) => unknown extends I ? O : unknown) {
    function cast<I>(input: I): unknown extends I ? O : unknown {
        return fn(input as any)
    }

    return cast
}

export function asFormData(data: Record<string, string | Blob>): FormData {
    const formData = new FormData()

    for (const key in data) {
        const value = data[key]
        mapSome(value, value => formData.append(key, value))
    }

    return formData
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HttpClientRequestOptions {
    authToken?: undefined | string
    baseUrl?: undefined | string
    body?: undefined | BodyInit | unknown
    encoder?: undefined | Io<Request, Request>
    headers?: undefined | HeadersInit
    method: RequestMethodEnum
    params?: undefined | UrlParams
    retry?: undefined | RequestRetryOptions
    url: string
}

export interface HttpClientResponseOptions<R, O = R> {
    decoder?: undefined | Io<R, O | Promise<O>>
}

export type HttpClientBaseOptions<R, O = R> = HttpClientRequestOptions & HttpClientResponseOptions<R, O>
export type HttpClientGetOptions<R, O = R> = Omit<HttpClientBaseOptions<R, O>, 'method'>
export type HttpClientDeleteOptions<R, O = R> = Omit<HttpClientBaseOptions<R, O>, 'method'>
export type HttpClientPatchOptions<R, O = R> = Omit<HttpClientBaseOptions<R, O>, 'method'>
export type HttpClientPutOptions<R, O = R> = Omit<HttpClientBaseOptions<R, O>, 'method'>
export type HttpClientPostOptions<R, O = R> = Omit<HttpClientBaseOptions<R, O>, 'method'>

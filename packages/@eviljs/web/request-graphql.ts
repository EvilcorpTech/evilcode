import {piping, type Io} from '@eviljs/std/pipe.js'
import {asSafeObject} from '@eviljs/std/type-safe.js'
import {usingRequestMethod} from './request-init.js'
import {usingRequestJson} from './request-json.js'
import {usingRequestParams} from './request-params.js'
import {ContentType, RequestMethod, pipingRequest, usingRequestOptions} from './request.js'
import {decodeResponseJson} from './response.js'

export const GraphqlQueryLeadingEmptiesRegexp = /\s+([{}])/g
export const GraphqlQueryTrailingEmptiesRegexp = /([{}])\s+/g

/**
* @throws TypeError
**/
export function usingRequestGraphqlGet(query: string, variables?: undefined | GraphqlQueryVariables): Io<Request, Request> {
    return pipingRequest(request => useRequestGraphqlGet(request, query, variables))
}

/**
* @throws TypeError
**/
export function useRequestGraphqlGet(request: Request, query: string, variables?: undefined | GraphqlQueryVariables): Request {
    return piping(request)
        (usingRequestOptions({
            method: RequestMethod.Get,
            headers: {
                'Accept': ContentType.Json,
            },
        }))
        (usingRequestParams({
            query: encodeURIComponent(compressGraphqlQuery(query)),
            variables: variables
                ? encodeURIComponent(JSON.stringify(variables))
                : undefined
            ,
        }))
    ()
}

/**
* @throws TypeError
**/
export function usingRequestGraphqlPost(query: string, variables?: undefined | GraphqlQueryVariables): Io<Request, Request> {
    return pipingRequest(request => useRequestGraphqlPost(request, query, variables))
}

/**
* @throws TypeError
**/
export function useRequestGraphqlPost(request: Request, query: string, variables?: undefined | GraphqlQueryVariables): Request {
    const body = {query, variables}

    return piping(request)
        (usingRequestMethod(RequestMethod.Post))
        (usingRequestJson(body, {
            'Accept': ContentType.Json,
        }))
    ()
}

/**
* @throws
**/
export function useResponseGraphql<V = unknown>(response: Response | Promise<Response>): Promise<V> {
    return Promise.resolve(response)
        .then(decodeResponseJson)
        .then(it => asSafeObject(it).data as V)
}

export function compressGraphqlQuery(query: string): string {
    return query
        .replaceAll(GraphqlQueryLeadingEmptiesRegexp, '$1')
        .replaceAll(GraphqlQueryTrailingEmptiesRegexp, '$1')
}

// Types ///////////////////////////////////////////////////////////////////////

export type GraphqlQueryVariables = Record<string, any>

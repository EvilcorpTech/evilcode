import {ContentType} from './request.js'

/**
* @throws
**/
export async function decodeResponse(responsePromise: Response | Promise<Response>): Promise<string | FormData | URLSearchParams | unknown> {
    const response = await responsePromise
    const type = response.headers.get('Content-Type')?.toLowerCase()

    if (! type) {
        return response.text()
    }
    if (type.startsWith(ContentType.Json)) {
        return response.json() as Promise<unknown>
    }
    if (type.startsWith(ContentType.FormData)) {
        return response.formData()
    }
    if (type.startsWith(ContentType.FormUrl)) {
        return response.text().then(it => new URLSearchParams(it))
    }
    return response.text()
}

/**
* @throws
**/
export function decodeResponseJson<T = unknown>(responsePromise: Response | Promise<Response>): Promise<T> {
    return Promise.resolve(responsePromise).then(it => it.json() as Promise<T>)
}

/**
* @throws Response
**/
export async function rejectOnResponseError(responsePromise: Response | Promise<Response>): Promise<Response> {
    return throwOnResponseError(await responsePromise)
}

/**
* @throws Response
**/
export function throwOnResponseError(response: Response): Response {
    if (! response.ok) {
        throw response
    }

    return response
}

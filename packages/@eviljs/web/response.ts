import {ContentType} from './request.js'

/**
* @throws
**/
export async function decodeResponse<T = string | FormData | URLSearchParams | unknown>(responsePromise: Response | Promise<Response>): Promise<T> {
    const response = await responsePromise
    const type = response.headers.get('Content-Type')?.toLowerCase()

    if (type && type.startsWith(ContentType.Json)) {
        return decodeResponseJson(response) as Promise<T>
    }
    if (type && type.startsWith(ContentType.FormData)) {
        return decodeResponseFormData(response) as Promise<T>
    }
    if (type && type.startsWith(ContentType.FormUrl)) {
        return decodeResponseUrlSearchParams(response) as Promise<T>
    }
    return decodeResponseText(response) as Promise<T>
}

/**
* @throws
**/
export function decodeResponseText(responsePromise: Response | Promise<Response>): Promise<string> {
    return Promise.resolve(responsePromise).then(it => it.text())
}

/**
* @throws
**/
export function decodeResponseFormData(responsePromise: Response | Promise<Response>): Promise<FormData> {
    return Promise.resolve(responsePromise).then(it => it.formData())
}

/**
* @throws
**/
export function decodeResponseUrlSearchParams(responsePromise: Response | Promise<Response>): Promise<URLSearchParams> {
    return decodeResponseText(responsePromise).then(it => new URLSearchParams(it))
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

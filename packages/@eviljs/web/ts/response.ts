import {FormDataType, FormUrlType, JsonType} from './mimetype.js'

/**
* @throws
**/
export async function decodeResponseBody<T = string | FormData | URLSearchParams | unknown>(responsePromise: Response | Promise<Response>): Promise<T> {
    const response = await responsePromise
    const type = response.headers.get('Content-Type')?.toLowerCase()

    if (type && type.startsWith(JsonType)) {
        return decodeResponseBodyAsJson(response) as Promise<T>
    }
    if (type && type.startsWith(FormDataType)) {
        return decodeResponseBodyAsFormData(response) as Promise<T>
    }
    if (type && type.startsWith(FormUrlType)) {
        return decodeResponseBodyAsUrlSearchParams(response) as Promise<T>
    }
    return decodeResponseBodyAsText(response) as Promise<T>
}

/**
* @throws
**/
export function decodeResponseBodyAsText(responsePromise: Response | Promise<Response>): Promise<string> {
    return Promise.resolve(responsePromise).then(it => it.text())
}

/**
* @throws
**/
export function decodeResponseBodyAsFormData(responsePromise: Response | Promise<Response>): Promise<FormData> {
    return Promise.resolve(responsePromise).then(it => it.formData())
}

/**
* @throws
**/
export function decodeResponseBodyAsUrlSearchParams(responsePromise: Response | Promise<Response>): Promise<URLSearchParams> {
    return decodeResponseBodyAsText(responsePromise).then(it => new URLSearchParams(it))
}

/**
* @throws
**/
export function decodeResponseBodyAsJson<T = unknown>(responsePromise: Response | Promise<Response>): Promise<T> {
    return Promise.resolve(responsePromise).then(it => it.json() as Promise<T>)
}

/**
* @throws Response
**/
export async function rejectResponseWhenError(responsePromise: Response | Promise<Response>): Promise<Response> {
    const response = await responsePromise

    try {
        return throwResponseWhenError(response)
    }
    catch {
        throw [response.status, await decodeResponseBody(response)]
    }
}

/**
* @throws Response
**/
export function throwResponseWhenError(response: Response): Response {
    if (! response.ok) {
        throw response
    }
    return response
}

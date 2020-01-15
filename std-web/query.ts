import { Fetch, FetchRequestMethod, FetchRequestOptions, JsonType } from './fetch'
import { kindOf } from '@eviljs/std-lib/type'
import { QueryRulesHeader, QueryArgs, QueryRules } from '@eviljs/std-lib/query'
import { throwInvalidArgument } from '@eviljs/std-lib/error'
import { throwInvalidResponse } from './error'

export function createQuery(fetch: Fetch) {
    const self: Query = {
        baseUrl: fetch.baseUrl,

        request(...args) {
            return query(fetch, ...args)
        },
        get(...args) {
            return self.request('get', ...args)
        },
        post(...args) {
            return self.request('post', ...args)
        },
        put(...args) {
            return self.request('put', ...args)
        },
        delete(...args) {
            return self.request('delete', ...args)
        },
    }

    Object.defineProperty(self, 'baseUrl', {
        get() {
            return fetch.baseUrl
        },
    })

    return self
}

export async function query(fetch: Fetch, method: QueryRequestMethod, path: string, options?: QueryRequestOptions) {
    const args = [
        setupQueryArgs,
        setupQueryRules,
    ].reduce((args, setup) =>
        setup(...args)
    , [path, options] as const)

    const response = await fetch.request(method, ...args)
    const type = response.headers.get('Content-Type')?.toLowerCase()

    if (! response.ok) {
        return throwInvalidResponse(
            '@eviljs/std-web/query.query() -> ~~Response~~:\n'
            + `Response must have a 2xx status, given "${response.status}" (${response.statusText}).`
        )
    }

    if (type?.includes(JsonType)) {
        return response.json()
    }

    return throwInvalidResponse(
        '@eviljs/std-web/query.query() -> ~~Response~~:\n'
        + `Response must have a content type of ${JsonType}, given "${type}".`
    )
}

export function setupQueryArgs(path: string, options?: QueryRequestOptions) {
    const args = options?.args

    if (! args) {
        return [path, options] as const
    }

    const sep = path.includes('?')
        ? '&'
        : '?'
    const parts = []

    for (const key in args) {
        const value = args[key]
        const valueType = kindOf(value,
            'undefined', 'null', 'boolean', 'number', 'string', 'array', 'object',
        )
        const keyPart = encodeURIComponent(key)

        switch (valueType) {
            case 'undefined':
                parts.push(keyPart)
                break
            case 'null':
            case 'boolean':
            case 'number':
                parts.push(`${keyPart}=${value}`)
                break
            case 'string':
                parts.push(`${keyPart}=${encodeURIComponent(value as string)}`)
                break
            case 'array':
            case 'object':
                parts.push(`${keyPart}=${encodeURIComponent(JSON.stringify(value))}`)
                break
            case void undefined:
            default:
                return throwInvalidArgument(
                    '@eviljs/std-web/query.setupQueryArgs(path, ~~options~~):\n'
                    + `options.args[${key}] is of an invalid type: "${value}".`
                )
        }
    }

    const newPath = path + sep + parts.join('&')

    return [newPath, options] as const
}

export function setupQueryRules(path: string, options?: QueryRequestOptions) {
    const rules = options?.rules

    if (! rules) {
        return [path, options] as const
    }

    // We use Object.assign() as workaround to a TypeScript compiler bug:
    // The inferred type of 'setupQueryRules' cannot be named without a reference
    // to '../std-react/node_modules/csstype'. This is likely not portable.
    // A type annotation is necessary.
    const newOptions = Object.assign({}, options, {
        headers: {
            ...options?.headers,
            [QueryRulesHeader]: JSON.stringify(rules),
        },
    })
    // // Original code.
    // const newOptions = {
    //     ...options,
    //     headers: {
    //         ...options?.headers,
    //         [QueryRulesHeader]: JSON.stringify(rules),
    //     },
    // }

    // const sep = path.includes('?')
    //     ? '&'
    //     : '?'
    // const encodedSelectors = encodeURIComponent(JSON.stringify(rules))
    // const path = `${path}${sep}@=${encodedSelectors}`
    // const query = [path] as const

    return [path, newOptions] as const
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Query {
    baseUrl: string
    request<T = unknown>(method: FetchRequestMethod, path: string, options?: QueryRequestOptions): Promise<T>
    get<T = unknown>(path: string, options?: QueryRequestOptions): Promise<T>
    post<T = unknown>(path: string, options?: QueryRequestOptions): Promise<T>
    put<T = unknown>(path: string, options?: QueryRequestOptions): Promise<T>
    delete<T = unknown>(path: string, options?: QueryRequestOptions): Promise<T>
}

export interface QueryRequestOptions extends FetchRequestOptions {
    args?: QueryArgs
    rules?: QueryRules
}

export type QueryRequestMethod = FetchRequestMethod
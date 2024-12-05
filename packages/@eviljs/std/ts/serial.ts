import type {ObjectPath} from './object-path.js'
import {getObjectPath, mapObjectValue, setObjectPath} from './object.js'
import {asArrayStrict, asDate} from './type-as.js'
import {assertArray, assertDefined} from './type-assert.js'
import {isArray, isBoolean, isNone, isNumber, isObject, isString, isSymbol} from './type-is.js'
import type {None} from './type-types.js'

export const SerialBuiltinCodec: {
    Date: SerialCodec<Date, number>
    Url: SerialCodec<URL, string>
    RegExp: SerialCodec<RegExp, string>
    Infinity: SerialCodec<typeof Infinity, number>
    Map: SerialCodec<Map<unknown, unknown>, Array<[unknown, unknown]>>
    Set: SerialCodec<Set<unknown>, Array<unknown>>
} = {
    Date: {
        id: 'Date',
        is(value) {
            return value instanceof Date
        },
        encode(date) {
            return date.getTime()
        },
        decode(dateEncoded) {
            return asDate(dateEncoded)
        },
    },
    Url: {
        id: 'Url',
        is(value) {
            return value instanceof URL
        },
        encode(url) {
            return url.toString()
        },
        decode(urlEncoded) {
            return new URL(urlEncoded)
        },
    },
    RegExp: {
        id: 'RegExp',
        is(value) {
            return value instanceof RegExp
        },
        encode(regexp) {
            return String(regexp)
        },
        decode(regexpEncoded) {
            const lastSlashIdx = regexpEncoded.lastIndexOf('/')
            const regexpString = regexpEncoded.slice(1, lastSlashIdx) // 1 removes first '/'.
            const regexpFlags = regexpEncoded.slice(lastSlashIdx + 1)

            return new RegExp(regexpString, regexpFlags)
        },
    },
    Infinity: {
        id: 'Infinity',
        is(value): value is number {
            return value === +Infinity || value === -Infinity
        },
        encode(infinity) {
            if (infinity === +Infinity) {
                return +1
            }
            if (infinity === -Infinity) {
                return -1
            }
            return 0
        },
        decode(infinityEncoded) {
            switch (infinityEncoded) {
                case +1: return +Infinity
                case -1: return -Infinity
            }
            return 0
        },
    },
    Map: {
        id: 'Map',
        is(value) {
            return value instanceof Map
        },
        encode(map, ctx) {
            return Array.from(map.entries()).map((entry, idx) => {
                const [key, value] = entry

                const valueEncoded = visitStruct(value, {...ctx, path: [...ctx.path, idx, 1]})

                return [key, valueEncoded]
            })
        },
        decode(mapEncoded) {
            return new Map(mapEncoded)
        },
    },
    Set: {
        id: 'Set',
        is(value) {
            return value instanceof Set
        },
        encode(set, ctx) {
            return Array.from(set.values()).map((value, idx) => {
                return visitStruct(value, {...ctx, path: [...ctx.path, idx]})
            })
        },
        decode(setEncoded) {
            return new Set(setEncoded)
        },
    },
}

export const SerialBuiltinsCodecsList: Array<SerialCodec> = Object.values(SerialBuiltinCodec)

export function serializeStruct(
    payload: unknown,
    codecsOptional?: undefined | Array<SerialCodec>,
): string {
    const codecs = codecsOptional ?? SerialBuiltinsCodecsList
    const stack: Array<[ObjectPath, string]> = []

    const data = visitStruct(payload, {codecs: codecs, path: [], stack: stack})

    return serializeAsJson({data: data, meta: stack})
}

export function visitStruct(value: unknown, ctx: SerialCodecContext): unknown {
    for (const codec of ctx.codecs) {
        const codecDidMatch = codec.is(value)

        if (! codecDidMatch) {
            continue
        }

        const valueEncoded = codec.encode(value, ctx)

        ctx.stack.push([ctx.path, codec.id])

        return valueEncoded
    }
    if (isPrimitive(value)) {
        return value
    }
    if (isArray(value)) {
        return value.map((it, idx) => {
            return visitStruct(it, {...ctx, path: [...ctx.path, idx]})
        })
    }
    if (isObject(value)) {
        return mapObjectValue(value, (val, key) => {
            if (isSymbol(key)) {
                // A key of type Symbol can't be serialized.
                return val
            }
            return visitStruct(val, {...ctx, path: [...ctx.path, key]})
        })
    }
    return value
}

export function isPrimitive(value: unknown): value is None | boolean | SerialCodecId {
    if (isNone(value)) {
        return true
    }
    if (isBoolean(value)) {
        return true
    }
    if (isNumber(value)) {
        return true
    }
    if (isString(value)) {
        return true
    }
    return false
}

export function deserializeStruct(
    payloadSerialized: string,
    codecsOptional?: undefined | Array<SerialCodec>,
): unknown {
    const codecs: Array<SerialCodec> = codecsOptional ?? SerialBuiltinsCodecsList

    const payload: any = deserializeFromJson(payloadSerialized)
    const data = payload?.data
    const meta = asArrayStrict(payload?.meta)

    if (! meta) {
        return data
    }

    assertArray(meta)

    for (const rule of meta) {
        assertArray(rule)

        const [path, codecId] = rule as [ObjectPath, SerialCodecId]

        assertArray(path)
        assertDefined(codecId)

        const codec = codecs.find(it => it.id === codecId)

        assertDefined(codec)

        const valueEncoded = getObjectPath(data, path)
        const valueDecoded = codec.decode(valueEncoded)

        setObjectPath(data, path, valueDecoded)
    }

    return payload?.data
}

export function serializeAsJson(payload: unknown): string {
    return JSON.stringify(payload)
}

export function deserializeFromJson(payloadSerialized: string): unknown {
    return JSON.parse(payloadSerialized)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SerialCodec<T = any, E = any> {
    id: SerialCodecId
    is(value: unknown): value is T
    encode(value: T, ctx: SerialCodecContext): E
    decode(valueEncoded: E): T
}

export interface SerialCodecContext {
    codecs: Array<SerialCodec>
    path: ObjectPath
    stack: Array<[ObjectPath, SerialCodecId]>
}

export type SerialCodecId = number | string

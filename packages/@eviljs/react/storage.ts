import {createAccessor} from '@eviljs/std/accessor.js'
import {scheduleMacroTask} from '@eviljs/std/eventloop.js'
import {tryCatch} from '@eviljs/std/try.js'
import {asBoolean, asNumber} from '@eviljs/std/type.js'
import type {BrowserStorageAccessorSync, BrowserStorageValue} from '@eviljs/web/storage.js'
import {useCallback, useState} from 'react'

export function useBrowserStorageAccessor<T = string>(accessor: BrowserStorageAccessorSync<T>): BrowserStorageManager<T> {
    // Reading from LocalStorage is slow, so we must wrap property access.
    const [value, setValue] = useState(() => accessor.value)

    const read = useCallback((): BrowserStorageValue<T> => {
        return value
    }, [value])

    const write = useCallback(<V extends BrowserStorageValue<T>>(newValue: V): V => {
        setValue(newValue)

        scheduleMacroTask(() => {
            accessor.value = newValue
        })

        return newValue
    }, [])

    return createAccessor(read, write)
}

export function useBrowserStorageCodec<T>(args: BrowserStorageManagerArgs<T>): BrowserStorageManager<T> {
    const {accessor, decode, encode} = args
    // Reading from LocalStorage is slow, so we must wrap property access.
    const [value, setValue] = useState(() => decode(accessor.value))

    const read = useCallback((): BrowserStorageValue<T> => {
        return value
    }, [value])

    const write = useCallback(<V extends BrowserStorageValue<T>>(newValue: V): V => {
        setValue(newValue)

        scheduleMacroTask(() => {
            accessor.value = encode(newValue)
        })

        return newValue
    }, [])

    return createAccessor(read, write)
}

export function useBrowserStorageString(accessor: BrowserStorageAccessorSync): BrowserStorageManager<string> {
    return useBrowserStorageCodec({
        accessor,
        encode: value => value ?? '',
        decode: value => value ?? '',
    })
}

export function useBrowserStorageNumber(accessor: BrowserStorageAccessorSync): BrowserStorageManager<number> {
    return useBrowserStorageCodec({
        accessor,
        encode: value => JSON.stringify(value),
        decode: value => value
            ? asNumber(tryCatch(() => JSON.parse(value) as unknown))
            : undefined
        ,
    })
}

export function useBrowserStorageBoolean(accessor: BrowserStorageAccessorSync): BrowserStorageManager<boolean> {
    return useBrowserStorageCodec({
        accessor,
        encode: value => JSON.stringify(value),
        decode: value => value
            ? asBoolean(tryCatch(() => JSON.parse(value) as unknown))
            : undefined
        ,
    })
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BrowserStorageManager<T> extends BrowserStorageAccessorSync<T> {
}

export interface BrowserStorageManagerArgs<T> {
    accessor: BrowserStorageAccessorSync
    encode(value: BrowserStorageValue<T>): BrowserStorageValue
    decode(value: BrowserStorageValue): BrowserStorageValue<T>
}

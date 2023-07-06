import {createAccessor} from '@eviljs/std/accessor.js'
import {scheduleMacroTask} from '@eviljs/std/eventloop.js'
import type {Io, TaskVoid} from '@eviljs/std/fn.js'
import {identity} from '@eviljs/std/return.js'
import {tryCatch} from '@eviljs/std/try.js'
import {asBoolean, asNumber} from '@eviljs/std/type.js'
import type {BrowserStorageAccessorSync, BrowserStorageValue} from '@eviljs/web/storage.js'
import {useCallback, useMemo, useRef, useState} from 'react'

export function useBrowserStorageAccessor<V = string>(
    accessor: BrowserStorageAccessorSync<V>,
    codecOptional?: undefined,
): BrowserStorageManager<V>
export function useBrowserStorageAccessor<V = string, S = string>(
    accessor: BrowserStorageAccessorSync<S>,
    codec: BrowserStorageManagerOptions<V>,
): BrowserStorageManager<V>
export function useBrowserStorageAccessor<V = string, S = string>(
    accessor: BrowserStorageAccessorSync<S>,
    codecOptional?: undefined | BrowserStorageManagerOptions<V>,
): BrowserStorageManager<S | V> {
    const decode = (codecOptional?.decode ?? identity) as Io<BrowserStorageValue<S>, BrowserStorageValue<S | V>>
    const encode = (codecOptional?.encode ?? identity) as Io<BrowserStorageValue<S | V>, BrowserStorageValue<S>>
    // Reading from LocalStorage is slow, so we must wrap value access.
    const [initialValue, render] = useState(() => decode(accessor.read()))
    const valueRef = useRef(initialValue)
    const cancelWriteTaskRef = useRef<TaskVoid>()

    const read = useCallback((): BrowserStorageValue<S | V> => {
        return valueRef.current
    }, [])

    const write = useCallback(<I extends BrowserStorageValue<S | V>>(newValue: I): I => {
        valueRef.current = newValue
        render(newValue)

        cancelWriteTaskRef.current?.()
        cancelWriteTaskRef.current = scheduleMacroTask(() => {
            // We can't use valueRef.current here, due to React 17/18 constraint
            // on references usage on unmounted components. When the the macro task
            // is executed, the component could be unmounted and the reference
            // would be undefined.
            accessor.write(encode(newValue))
            cancelWriteTaskRef.current = undefined
        })

        return newValue
    }, [])

    const accessorManager = useMemo(() => {
        return createAccessor(read, write)
    }, [read, write])

    return accessorManager
}

export function useBrowserStorageString(accessor: BrowserStorageAccessorSync<string>): BrowserStorageManager<string> {
    return useBrowserStorageAccessor(accessor, {
        encode: value => value ?? '',
        decode: value => value ?? '',
    })
}

export function useBrowserStorageNumber(accessor: BrowserStorageAccessorSync<string>): BrowserStorageManager<number> {
    return useBrowserStorageAccessor(accessor, {
        encode: value => JSON.stringify(value),
        decode: value => value
            ? asNumber(tryCatch(() => JSON.parse(value) as unknown))
            : undefined
        ,
    })
}

export function useBrowserStorageBoolean(accessor: BrowserStorageAccessorSync<string>): BrowserStorageManager<boolean> {
    return useBrowserStorageAccessor(accessor, {
        encode: value => JSON.stringify(value),
        decode: value => value
            ? asBoolean(tryCatch(() => JSON.parse(value) as unknown))
            : undefined
        ,
    })
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BrowserStorageManager<V> extends BrowserStorageAccessorSync<V> {
}

export interface BrowserStorageManagerOptions<V, S = string> {
    encode: Io<BrowserStorageValue<V>, BrowserStorageValue<S>>
    decode: Io<BrowserStorageValue<S>, BrowserStorageValue<V>>
}

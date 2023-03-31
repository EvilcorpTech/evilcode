import type {AccessorSync} from '@eviljs/std/accessor.js'
import {createAccessor} from '@eviljs/std/accessor.js'
import {tryCatch} from '@eviljs/std/try.js'
import {asBoolean, asNumber, isUndefined} from '@eviljs/std/type.js'

export function createBrowserStorageAccessor(
    key: string,
    options?: undefined | BrowserStorageAccessorOptions,
): BrowserStorageAccessorSync {
    const storage: Storage = options?.storage ?? window.localStorage

    function read(): BrowserStorageValue {
        return storage.getItem(key) ?? undefined
    }

    function write<T extends BrowserStorageValue>(newValue: T): T {
        if (isUndefined(newValue)) {
            storage.removeItem(key)
        }
        else {
            storage.setItem(key, newValue)
        }
        return newValue
    }

    return createAccessor(read, write)
}

export function createBrowserStorageAccessorJson<T = unknown>(
    key: string,
    options?: undefined | BrowserStorageAccessorOptions,
): BrowserStorageAccessorSync<T> {
    const accessor = createBrowserStorageAccessor(key, options)

    function read(): BrowserStorageValue<T> {
        const value = accessor.read()

        return value
            ? tryCatch(() => JSON.parse(value) as T)
            : undefined
    }

    function write<V extends BrowserStorageValue<T>>(newValue: V): V {
        accessor.write(JSON.stringify(newValue))

        return newValue
    }

    return createAccessor(read, write)
}

export function createBrowserStorageAccessorString(
    key: string,
    options?: undefined | BrowserStorageAccessorOptions,
): BrowserStorageAccessorSync<string> {
    return createBrowserStorageAccessor(key, options)
}

export function createBrowserStorageAccessorNumber(
    key: string,
    options?: undefined | BrowserStorageAccessorOptions,
): BrowserStorageAccessorSync<number> {
    const accessor = createBrowserStorageAccessor(key, options)

    function read(): BrowserStorageValue<number> {
        const value = accessor.read()

        return value
            ? asNumber(tryCatch(() => JSON.parse(value) as unknown))
            : undefined
    }

    function write<V extends BrowserStorageValue<number>>(newValue: V): V {
        accessor.write(JSON.stringify(newValue))

        return newValue
    }

    return createAccessor(read, write)
}

export function createBrowserStorageAccessorBoolean(
    key: string,
    options?: undefined | BrowserStorageAccessorOptions,
): BrowserStorageAccessorSync<boolean> {
    const accessor = createBrowserStorageAccessor(key, options)

    function read(): BrowserStorageValue<boolean> {
        const value = accessor.read()

        return value
            ? asBoolean(tryCatch(() => JSON.parse(value) as unknown))
            : undefined
    }

    function write<V extends BrowserStorageValue<boolean>>(newValue: V): V {
        accessor.write(JSON.stringify(newValue))

        return newValue
    }

    return createAccessor(read, write)
}

// Types ///////////////////////////////////////////////////////////////////////

export type BrowserStorageValue<T = string> = undefined | T

export interface BrowserStorageAccessorSync<T = string> extends AccessorSync<BrowserStorageValue<T>> {
}

export interface BrowserStorageAccessorOptions {
    storage?: undefined | Storage
}

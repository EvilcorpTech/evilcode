import type {Io, Task} from './fn.js'

export function memoizing<R>(fn: Task<R>): Task<R> {
    let executed = false
    let value: R

    function singleton(): R {
        if (! executed) {
            executed = true
            value = fn()
        }
        return value
    }

    return singleton
}

export function createCache<K, V>(): CacheManager<K, V> {
    const cacheMap = new Map<K, V>()

    function use(key: K, computeValue: Io<K, V>): undefined | V {
        if (cacheMap.has(key)) {
            return cacheMap.get(key)
        }

        const value = computeValue(key)
        cacheMap.set(key, value)
        return value
    }

    const clear = cacheMap.clear.bind(cacheMap)

    return {use, clear}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CacheManager<K, V> {
    use(key: K, computeValue: Io<K, V>): undefined | V
    clear(): void
}

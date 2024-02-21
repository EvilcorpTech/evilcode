import type {Io} from './fn-type.js'

export function createCache<K, V>(): CacheManager<K, V> {
    const cacheMap = new Map<K, undefined | V>()

    function use(key: K, computeValue: Io<K, V>): V {
        return useCachedResult(cacheMap, key, computeValue)
    }

    return {use, map: cacheMap}
}

export function useCachedResult<K, V>(
    cacheMap: Map<K, undefined | V>,
    key: K,
    computeValue: Io<K, V>,
): V {
    const result = cacheMap.get(key) ?? (() => {
        const value = computeValue(key)
        cacheMap.set(key, value)
        return value
    })()

    return result
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CacheManager<K, V> {
    use(key: K, computeValue: Io<K, V>): V
    map: Map<K, undefined | V>
}

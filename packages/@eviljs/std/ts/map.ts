export function getMapValue<K, V>(map: Map<K, undefined | V>, key: K, init: () => V): V {
    function initMapValue(): V {
        const value: V = init()

        map.set(key, value)

        return value
    }

    return map.get(key) ?? initMapValue()
}

/**
* Map.set() returns Map. This API does the opposite, returns the value.
*/
export function setMapValue<K, V>(map: Map<K, V>, key: K, value: V): V {
    map.set(key, value)

    return value
}

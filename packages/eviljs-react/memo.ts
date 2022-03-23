import {useMemo} from 'react'

export function useMemoObject<O extends {}>(value: O) {
    return useMemo(() => value, Object.values(value))
}

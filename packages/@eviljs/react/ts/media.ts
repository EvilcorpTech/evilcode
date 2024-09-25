import { useEffect, useMemo, useState } from 'react'

export function useMediaQuery(query: string): boolean {
    type QueryMatchesState = Record<string, boolean>

    const [queryMatches, setQueryMatches] = useState<QueryMatchesState>({})

    const mediaQuery = useMemo(() => {
        if (! window) {
            return
        }

        return window.matchMedia(query)
    }, [query])

    useEffect(() => {
        if (! mediaQuery) {
            return
        }

        function onMediaChange(event: MediaQueryListEvent) {
            setQueryMatches({
                [event.media]: event.matches,
            })
        }

        mediaQuery.addEventListener('change', onMediaChange)

        return () => {
            mediaQuery.removeEventListener('change', onMediaChange)
        }
    }, [mediaQuery])

    return queryMatches[query] // Most updated result, if available, on media change.
        ?? mediaQuery?.matches // Immediate correct result, on query string change.
        ?? false // Server side, no media query should match.
}

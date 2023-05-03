import {useEffect} from 'react'
import {Theme, themeClassesOf} from '~/theme/apis'

export function useColorSchemePreference() {
    useEffect(() => {
        const prefersColorSchemeDarkQuery = window.matchMedia('(prefers-color-scheme: dark)')

        function onThemeChange(event: Pick<MediaQueryListEvent, 'matches'>) {
            const isDark = event.matches
            document.documentElement.classList.remove(
                ...themeClassesOf(Theme.Dark),
                ...themeClassesOf(Theme.Light),
            )
            document.documentElement.classList.add(
                ...themeClassesOf(isDark ? Theme.Dark : Theme.Light)
            )
        }

        onThemeChange(prefersColorSchemeDarkQuery)

        prefersColorSchemeDarkQuery.addEventListener('change', onThemeChange)

        function onClean() {
            prefersColorSchemeDarkQuery.removeEventListener('change', onThemeChange)
        }

        return onClean
    }, [])
}

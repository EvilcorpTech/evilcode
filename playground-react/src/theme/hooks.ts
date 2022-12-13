import {useEffect} from 'react'

export function useColorSchemePreference() {
    useEffect(() => {
        const prefersColorSchemeDarkQuery = window.matchMedia('(prefers-color-scheme: dark)')

        function onThemeChange(event: Pick<MediaQueryListEvent, 'matches'>) {
            const isDark = event.matches
            const theme = isDark ? 'theme-dark' : 'theme-light'
            document.documentElement.classList.remove('theme-light', 'theme-dark')
            document.documentElement.classList.add('std', theme)
        }

        onThemeChange(prefersColorSchemeDarkQuery)

        prefersColorSchemeDarkQuery.addEventListener('change', onThemeChange)

        function onClean() {
            prefersColorSchemeDarkQuery.removeEventListener('change', onThemeChange)
        }

        return onClean
    }, [])
}

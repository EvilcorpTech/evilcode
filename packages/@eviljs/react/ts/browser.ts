import {hasBrowserTouch} from '@eviljs/web/browser'
import {useEffect} from 'react'
import {useStateTransition} from './state.js'

export function useBrowserFeaturesClassesProvider(activeOptional?: undefined | boolean): void {
    const features = useBrowserFeatures()
    const active = activeOptional ?? true

    useEffect(() => {
        if (! active) {
            return
        }

        const featuresMap = {
            'has-touch': features.touch,
        }
        const featuresList = Object.entries(featuresMap)
        const allClasses = featuresList.map(it => it[0])
        const activeClasses = featuresList.filter(it => it[1]).map(it => it[0])

        document.documentElement.classList.remove(...allClasses)
        document.documentElement.classList.add(...activeClasses)

    }, [features, active])
}

export function useBrowserFeatures(): BrowserFeatures {
    const [features, setFeatures] = useStateTransition(listBrowserFeatures)

    useEffect(() => {
        // Compatibility with DevTools:
        // supports switching between desktop and mobile inspectors.
        function updateFeatures() {
            setFeatures(listBrowserFeatures())
        }

        window.addEventListener('resize', updateFeatures)

        function onClean() {
            window.removeEventListener('resize', updateFeatures)
        }

        return onClean
    }, [])

    return features
}

export function listBrowserFeatures(): BrowserFeatures {
    return {
        touch: hasBrowserTouch(),
    }
}

// Types ///////////////////////////////////////////////////////////////////////

interface BrowserFeatures {
    touch: boolean
}

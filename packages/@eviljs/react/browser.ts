import {hasBrowserTouch} from '@eviljs/web/browser.js'
import {useEffect, useState} from 'react'

export function useRootBrowserFeatures() {
    const features = useBrowserFeatures()

    useEffect(() => {
        const featuresMap = {
            'no-js': false,
            'has-touch': features.touch,
        }
        const featuresList = Object.entries(featuresMap)
        const allClasses = featuresList.map(it => it[0])
        const activeClasses = featuresList.filter(it => it[1]).map(it => it[0])

        document.documentElement.classList.remove(...allClasses)
        document.documentElement.classList.add(...activeClasses)

    }, [features])
}

export function useBrowserFeatures() {
    const [features, setFeatures] = useState(listBrowserFeatures)

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

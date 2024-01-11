import {useInsertionEffect} from 'react'
import {useStyleContext} from './style-provider.js'

export * from './style-provider.js'

export function useStyle(style: string) {
    const stylesManager = useStyleContext()!

    useInsertionEffect(() => {
        stylesManager.useStyle(style)

        function onClean() {
            stylesManager.cleanStyle(style)
        }

        return onClean
    }, [stylesManager, style])
}

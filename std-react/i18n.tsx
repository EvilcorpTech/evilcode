import { createContext, createElement, useContext, useMemo } from 'react'
import { I18n } from '@eviljs/std-lib/i18n'

export const I18nContext = createContext<I18n>(void undefined as any)

export function useI18n() {
    return useContext(I18nContext)
}

export function useI18nMsg<T>(compute: I18nMsgsComputer<T>) {
    const i18n = useI18n()

    const i18nMsg = useMemo(() => {
        return {
            ...compute(i18n),
            $i18n: i18n,
        }
    }, [i18n, i18n.locale, i18n.fallbackLocale])

    return i18nMsg
}

export function I18nProvider(props: I18nProviderProps) {
    const { i18n, children } = props

    return (
        <I18nContext.Provider value={i18n}>
            {children}
        </I18nContext.Provider>
    )
}

export function withI18n(Child: React.ComponentType, i18n: I18n) {
    function I18nWrapper(props: any) {
        return (
            <I18nProvider i18n={i18n}>
                <Child {...props}/>
            </I18nProvider>
        )
    }

    return I18nWrapper
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18nProviderProps {
    children?: React.ReactNode
    i18n: I18n
}

export interface I18nMsgsComputer<T> {
    (i18n: I18n): T
}
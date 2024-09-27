export const DemoLocalesList = ['it' as const, 'en' as const]
export const DemoLocaleDefault = 'en'
export const DemoLocaleFallback = 'en'

// Types ///////////////////////////////////////////////////////////////////////

export type DemoLocale = (typeof DemoLocalesList)[number]

export enum Theme {
    Dark = 'dark',
    Light = 'light',
}

export function themeClassOf(theme: Theme) {
    return `std theme-${theme}`
}

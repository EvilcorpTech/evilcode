export enum Theme {
    Light = 'light',
    Dark = 'dark',
}

export function themeClassOf(theme: Theme) {
    return `std theme-${theme}`
}

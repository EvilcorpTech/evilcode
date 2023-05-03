export enum Theme {
    Dark = 'dark',
    Light = 'light',
}

export function themeClassesOf(theme: Theme): Array<string> {
    return ['std', `theme-${theme}`, 'std-text', 'std-color-theme']
}

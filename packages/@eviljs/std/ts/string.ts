export function capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export function capitalizeEveryWord(text: string): string {
    return text.split(' ').map(capitalizeFirst).join(' ')
}

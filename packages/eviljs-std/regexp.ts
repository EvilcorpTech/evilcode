export function escapeRegexp(string: string) {
    return string.replace(/[.*+?^${}[\]()|\\]/g, '\\$&')
}

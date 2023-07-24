export function hasBitmaskFlag(mask: number, flag: number): boolean {
    return Boolean(mask & flag)
}

export function withBitmaskFlag(mask: number, flag: number): number {
    return mask | flag
}

export function omitBitmaskFlag(mask: number, flag: number): number {
    return mask & ~flag
}

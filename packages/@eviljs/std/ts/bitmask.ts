export function withBitmaskFlag(mask: number, flag: number): number {
    return mask | flag
}

export function withoutBitmaskFlag(mask: number, flag: number): number {
    return mask & ~flag
}

export function hasBitmaskFlag(mask: number, flag: number): boolean {
    return Boolean(mask & flag)
}

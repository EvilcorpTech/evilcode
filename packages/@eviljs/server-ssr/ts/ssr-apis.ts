// Types ///////////////////////////////////////////////////////////////////////

export type SsrResult = SsrRenderOutput

export interface SsrRenderOutput {
    body: string
    created: number
}

export interface SsrCacheEntry {
    result: SsrRenderOutput
    expires: number
}

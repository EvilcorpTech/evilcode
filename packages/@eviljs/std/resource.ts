export enum ResourceLifecycle {
    Initial = 0,
    Required = 1<<0,
    Expired = 1<<1,
    Loading = 1<<2,
    Loaded = 1<<3,
    Failed = 1<<4,
}

export function asResourceView(mask: undefined | ResourceLifecycle): ResourceLifecycleView {
    return {
        required: isResourceRequired(mask),
        expired: isResourceExpired(mask),
        loading: isResourceLoading(mask),
        loaded: isResourceLoaded(mask),
        failed: isResourceFailed(mask),
    }
}

export function isResourceRequired(maskOptional: undefined | ResourceLifecycle): boolean {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return Boolean(mask & ResourceLifecycle.Required)
}

export function isResourceExpired(maskOptional: undefined | ResourceLifecycle): boolean {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return Boolean(mask & ResourceLifecycle.Expired)
}

export function isResourceLoading(maskOptional: undefined | ResourceLifecycle): boolean {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return Boolean(mask & ResourceLifecycle.Loading)
}

export function isResourceLoaded(maskOptional: undefined | ResourceLifecycle): boolean {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return Boolean(mask & ResourceLifecycle.Loaded)
}

export function isResourceFailed(maskOptional: undefined | ResourceLifecycle): boolean {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return Boolean(mask & ResourceLifecycle.Failed)
}

export function withResourceRequired(maskOptional: undefined | ResourceLifecycle): ResourceLifecycle {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return mask
        | ResourceLifecycle.Required
}

export function withResourceLoading(maskOptional: undefined | ResourceLifecycle): ResourceLifecycle {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return mask
        // & ~ResourceControl.Loaded // A resource should remain loaded while loading.
        // & ~ResourceControl.Failed // A resource should remain failed while loading.
        | ResourceLifecycle.Loading
}

export function withResourceLoaded(maskOptional: undefined | ResourceLifecycle): ResourceLifecycle {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return mask
        & ~ResourceLifecycle.Loading
        & ~ResourceLifecycle.Failed
        & ~ResourceLifecycle.Expired
        | ResourceLifecycle.Loaded
}

export function withResourceFailed(maskOptional: undefined | ResourceLifecycle): ResourceLifecycle {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return mask
        & ~ResourceLifecycle.Loading
        // & ~ResourceControl.Loaded // A resource should remain loaded after a failure.
        | ResourceLifecycle.Failed
}

export function withResourceCanceled(maskOptional: undefined | ResourceLifecycle): ResourceLifecycle {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return mask
        & ~ResourceLifecycle.Loading
}

export function withResourceExpired(maskOptional: undefined | ResourceLifecycle): ResourceLifecycle {
    const mask = maskOptional ?? ResourceLifecycle.Initial
    return mask
        | ResourceLifecycle.Expired
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ResourceLifecycleView {
    required: boolean
    expired: boolean
    loading: boolean
    loaded: boolean
    failed: boolean
}

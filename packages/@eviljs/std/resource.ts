export enum ResourceFlag {
    Required = 1<<0,
    Expired = 1<<1,
    Loading = 1<<2,
    Loaded = 1<<3,
    Failed = 1<<4,
}

export function asResourceState(mask: undefined | ResourceFlag): ResourceState {
    return {
        required: isResourceRequired(mask),
        expired: isResourceExpired(mask),
        loading: isResourceLoading(mask),
        loaded: isResourceLoaded(mask),
        failed: isResourceFailed(mask),
    }
}

export function isResourceRequired(mask: undefined | ResourceFlag): boolean {
    return Boolean((mask ?? 0) & ResourceFlag.Required)
}

export function isResourceExpired(mask: undefined | ResourceFlag): boolean {
    return Boolean((mask ?? 0) & ResourceFlag.Expired)
}

export function isResourceLoading(mask: undefined | ResourceFlag): boolean {
    return Boolean((mask ?? 0) & ResourceFlag.Loading)
}

export function isResourceLoaded(mask: undefined | ResourceFlag): boolean {
    return Boolean((mask ?? 0) & ResourceFlag.Loaded)
}

export function isResourceFailed(mask: undefined | ResourceFlag): boolean {
    return Boolean((mask ?? 0) & ResourceFlag.Failed)
}

export function withResourceRequired(mask: undefined | ResourceFlag): ResourceFlag {
    return (mask ?? 0) | ResourceFlag.Required
}

export function withResourceLoading(mask: undefined | ResourceFlag): ResourceFlag {
    return (mask ?? 0)
        | ResourceFlag.Loading
        // & ~ResourceControl.Loaded // A resource should remain loaded while loading.
        // & ~ResourceControl.Failed // A resource should remain failed while loading.
}

export function withResourceLoaded(mask: undefined | ResourceFlag): ResourceFlag {
    return (mask ?? 0)
        | ResourceFlag.Loaded
        & ~ResourceFlag.Loading
        & ~ResourceFlag.Failed
        & ~ResourceFlag.Expired
}

export function withResourceFailed(mask: undefined | ResourceFlag): ResourceFlag {
    return (mask ?? 0)
        | ResourceFlag.Failed
        & ~ResourceFlag.Loading
        // & ~ResourceControl.Loaded // A resource should remain loaded after a failure.
}

export function withResourceExpired(mask: undefined | ResourceFlag): ResourceFlag {
    return (mask ?? 0) | ResourceFlag.Expired
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ResourceState {
    required: boolean
    expired: boolean
    loading: boolean
    loaded: boolean
    failed: boolean
}

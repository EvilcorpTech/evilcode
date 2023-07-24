import {hasBitmaskFlag, omitBitmaskFlag, withBitmaskFlag} from './bitmask.js'

export enum ResourceMask {
    Initial = 0,
    Required = 1<<0,
    Loading = 1<<1,
    Loaded = 1<<2,
    Failed = 1<<3,
    Expired = 1<<4,
}

export function asResourceView(mask: ResourceMask): ResourceMaskView {
    return {
        expired: isResourceExpired(mask),
        failed: isResourceFailed(mask),
        loaded: isResourceLoaded(mask),
        loading: isResourceLoading(mask),
        required: isResourceRequired(mask),
    }
}

export function asPromiseView(mask: ResourceMask): ResourcePromiseView {
    return {
        fulfilled: isResourceLoaded(mask),
        pending: isResourceLoading(mask),
        rejected: isResourceFailed(mask),
    }
}

export function isResource(mask: ResourceMask, flag: ResourceMask): boolean {
    return hasBitmaskFlag(mask, flag)
}

export function withResource(mask: ResourceMask, flag: ResourceMask): ResourceMask {
    return withBitmaskFlag(mask, flag)
}

export function withoutResource(mask: ResourceMask, flag: ResourceMask): ResourceMask {
    return omitBitmaskFlag(mask, flag)
}

// Required ////////////////////////////////////////////////////////////////////

export function isResourceRequired(mask: ResourceMask): boolean {
    return isResource(mask, ResourceMask.Required)
}

export function withResourceRequired(mask: ResourceMask): ResourceMask {
    return withResource(mask, ResourceMask.Required)
}

export function withoutResourceRequired(mask: ResourceMask): ResourceMask {
    return withoutResource(mask, ResourceMask.Required)
}

// Loading /////////////////////////////////////////////////////////////////////

export function isResourceLoading(mask: ResourceMask): boolean {
    return isResource(mask, ResourceMask.Loading)
}

export function withResourceLoading(mask: ResourceMask): ResourceMask {
    return withResource(mask, ResourceMask.Loading)
}

export function withoutResourceLoading(mask: ResourceMask): ResourceMask {
    return withoutResource(mask, ResourceMask.Loading)
}

// Loaded //////////////////////////////////////////////////////////////////////

export function isResourceLoaded(mask: ResourceMask): boolean {
    return isResource(mask, ResourceMask.Loaded)
}

export function withResourceLoaded(mask: ResourceMask): ResourceMask {
    return withResource(mask, ResourceMask.Loaded)
}

export function withoutResourceLoaded(mask: ResourceMask): ResourceMask {
    return withoutResource(mask, ResourceMask.Loaded)
}

// Failed //////////////////////////////////////////////////////////////////////

export function isResourceFailed(mask: ResourceMask): boolean {
    return isResource(mask, ResourceMask.Failed)
}

export function withResourceFailed(mask: ResourceMask): ResourceMask {
    return withResource(mask, ResourceMask.Failed)
}

export function withoutResourceFailed(mask: ResourceMask): ResourceMask {
    return withoutResource(mask, ResourceMask.Failed)
}

// Expired /////////////////////////////////////////////////////////////////////

export function isResourceExpired(mask: ResourceMask): boolean {
    return isResource(mask, ResourceMask.Expired)
}

export function withResourceExpired(mask: ResourceMask): ResourceMask {
    return withResource(mask, ResourceMask.Expired)
}

export function withoutResourceExpired(mask: ResourceMask): ResourceMask {
    return withoutResource(mask, ResourceMask.Expired)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ResourceMaskView {
    expired: boolean
    failed: boolean
    loaded: boolean
    loading: boolean
    required: boolean
}

export interface ResourcePromiseView {
    fulfilled: boolean
    pending: boolean
    rejected: boolean
}

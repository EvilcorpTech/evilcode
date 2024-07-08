import {hasBitmaskFlag, omitBitmaskFlag, withBitmaskFlag} from './bitmask.js'

export const ResourceMask = {
    Initial: 0,
    Required: 1<<0 as number,
    Loading: 1<<1 as number,
    Loaded: 1<<2 as number,
    Failed: 1<<3 as number,
    Expired: 1<<4 as number,
}

export function asResourceView(mask: number): ResourceMaskView {
    return {
        expired: isResourceExpired(mask),
        failed: isResourceFailed(mask),
        loaded: isResourceLoaded(mask),
        loading: isResourceLoading(mask),
        required: isResourceRequired(mask),
    }
}

export function asPromiseView(mask: number): ResourcePromiseView {
    return {
        fulfilled: isResourceLoaded(mask),
        pending: isResourceLoading(mask),
        rejected: isResourceFailed(mask),
    }
}

export function isResource(mask: number, flag: number): boolean {
    return hasBitmaskFlag(mask, flag)
}

export function withResource(mask: number, flag: number): number {
    return withBitmaskFlag(mask, flag)
}

export function withoutResource(mask: number, flag: number): number {
    return omitBitmaskFlag(mask, flag)
}

// Required ////////////////////////////////////////////////////////////////////

export function isResourceRequired(mask: number): boolean {
    return isResource(mask, ResourceMask.Required)
}

export function withResourceRequired(mask: number): number {
    return withResource(mask, ResourceMask.Required)
}

export function withoutResourceRequired(mask: number): number {
    return withoutResource(mask, ResourceMask.Required)
}

// Loading /////////////////////////////////////////////////////////////////////

export function isResourceLoading(mask: number): boolean {
    return isResource(mask, ResourceMask.Loading)
}

export function withResourceLoading(mask: number): number {
    return withResource(mask, ResourceMask.Loading)
}

export function withoutResourceLoading(mask: number): number {
    return withoutResource(mask, ResourceMask.Loading)
}

// Loaded //////////////////////////////////////////////////////////////////////

export function isResourceLoaded(mask: number): boolean {
    return isResource(mask, ResourceMask.Loaded)
}

export function withResourceLoaded(mask: number): number {
    return withResource(mask, ResourceMask.Loaded)
}

export function withoutResourceLoaded(mask: number): number {
    return withoutResource(mask, ResourceMask.Loaded)
}

// Failed //////////////////////////////////////////////////////////////////////

export function isResourceFailed(mask: number): boolean {
    return isResource(mask, ResourceMask.Failed)
}

export function withResourceFailed(mask: number): number {
    return withResource(mask, ResourceMask.Failed)
}

export function withoutResourceFailed(mask: number): number {
    return withoutResource(mask, ResourceMask.Failed)
}

// Expired /////////////////////////////////////////////////////////////////////

export function isResourceExpired(mask: number): boolean {
    return isResource(mask, ResourceMask.Expired)
}

export function withResourceExpired(mask: number): number {
    return withResource(mask, ResourceMask.Expired)
}

export function withoutResourceExpired(mask: number): number {
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

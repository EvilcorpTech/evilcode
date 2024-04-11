export function paginatedRange(
    totalSize: number,
    pageSize: number,
    requestedPage: number,
): PaginationInfo {
    const pages = Math.ceil(totalSize / pageSize)
    const page = Math.min(requestedPage, pages)

    // Page and range are 1-indexed (not 0-indexed).
    const start = ((page - 1) * pageSize) + 1
    const end = Math.min(start + pageSize - 1, totalSize)

    return {start, end, page, pages, pageSize, totalSize}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PaginationInfo {
    start: number
    end: number
    page: number
    pages: number
    pageSize: number
    totalSize: number
}

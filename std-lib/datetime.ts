export function intervalOfCurrentMonth() {
    const now = new Date()
    const start = new Date(year(now), month(now) - 1, 1)
    const end = new Date(year(now), month(now), 0) // Last day of the month.
    return intervalOf(start, end)
}

export function intervalOfPreviousMonth() {
    const now = new Date()
    const start = new Date(year(now), month(now) - 2, 1)
    const end = new Date(year(now), month(now) - 1, 0) // Last day of the month.
    return intervalOf(start, end)
}

export function intervalOfCurrentYear() {
    const now = new Date()
    const start = new Date(year(now), 0, 1)
    const end = new Date(year(now), 11, 31)
    return intervalOf(start, end)
}

export function intervalOfPreviousYear() {
    const now = new Date()
    const start = new Date(year(now) - 1, 0, 1)
    const end = new Date(year(now) - 1, 11, 31)
    return intervalOf(start, end)
}

export function intervalCustom(startStr: string, endStr: string) {
    if (! startStr && ! endStr) {
        return
    }
    if (startStr && isNaN(Date.parse(startStr))) {
        return
    }
    if (endStr && isNaN(Date.parse(endStr))) {
        return
    }

    // We can't use "new Date(string)" because it changes its behaviour
    // (uses or not the timezone) depending on the format of the string:
    // - 2020-01 is handled as UTC time
    // - 2020-1 is handled as Local time
    const start = dateFromString(startStr, (year, month, day) =>
        new Date(year, (month || 1) - 1, day || 1)
    )
    const end = dateFromString(endStr, (year, month, day) => day
        ? new Date(year, (month || 12) - 1, day)
        : new Date(year, (month || 12), 0) // Last day of the month.
    )

    return intervalOf(start, end)
}

export function intervalOf(start?: Date, end?: Date) {
    return {
        start: start ? datetimeToDateString(start) : undefined,
        end: end ? datetimeToDateString(end) : undefined,
    }
}

export function datetimeToDateString(date: Date) {
    if (! date) {
        return
    }
    return `${year(date)}-${month(date)}-${day(date)}`
}

export function dateFromString(dateStr: string, createDate: (...parts: Array<number>) => Date) {
    if (! dateStr) {
        return
    }

    const dateParts = dateStr
        // 2020-01-01 12:00 => 2020-01-01 12:00
        // 2020-01-01T12:00 => 2020-01-01 12:00
        .replace('T', ' ')
        // 2020-01-01 12:00 => 2020-01-01
        .split('T')[0]
        .split('-')
        // 2020-01- => 2020-01
        .filter(Boolean)
        .map(Number)
    const date = createDate(...dateParts)

    return date
}

export function year(date: Date) {
    return date.getFullYear()
}

export function month(date: Date) {
    return date.getMonth() + 1
}

export function day(date: Date) {
    return date.getDate()
}
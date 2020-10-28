import {Button} from './button.js'
import {classes, times} from '../react.js'
import {Range} from '@eviljs/std-lib/range.js'
import {useI18nMsg} from '../i18n.js'
import React from 'react'

export {paginatedRange} from '@eviljs/std-lib/range.js'

export function Paginator(props: PaginatorProps) {
    const {
        page,
        pages,
        maxPages = 5,
        back,
        next,
        of,
        onBack,
        onNext,
        onSelect,
        start: omittedStart,
        end: omittedEnd,
        pageSize: omittedPageSize,
        totalSize: omittedTotalSize,
        ...otherProps
    } = props

    // The number of pagination pages to show.
    // EXAMPLE
    // With 3, we have a pagination like this:
    // 1 2 3 NEXT>
    // With 5, we have a pagination like this:
    // 1 2 3 4 5 NEXT>
    const boundMaxPages = Math.min(pages, maxPages)

    const msg = useI18nMsg(({ t }) => {
        return {
            of: t`of`,
            next: t`next`,
            back: t`back`,
        }
    })

    return (
        <div
            {...otherProps}
            className={classes('paginator-a9e2dc', props.className)}
        >
            {page > 1 &&
                <div className="action-a14751 back">
                    <Button
                        className="scroll-28f8d5 previous"
                        type="plain"
                        onClick={onBack}
                    >
                        {back || msg.back}
                    </Button>
                </div>
            }

            <ul className="list-07305d">
                {times(boundMaxPages).map(idx => {
                    const it = Math.max(page - boundMaxPages, 0) + idx + 1
                    const selected = page === it

                    return (
                        <li
                            key={idx}
                            className={classes('item-824326', {selected})}
                            onClick={() => onSelect(it)}
                        >
                            <Button
                                className="button-78c736"
                                type="plain"
                            >
                                {it}
                            </Button>
                        </li>
                    )
                })}
            </ul>

            {pages > boundMaxPages &&
                <div className="counter-fb356f">
                    <span className="count-d22431">
                        {msg.of} {pages}
                    </span>
                </div>
            }

            {pages > boundMaxPages &&
                <div className="action-a14751 next">
                    <Button
                        className="scroll-28f8d5 next"
                        type="plain"
                        disabled={page === pages}
                        onClick={onNext}
                    >
                        {next || msg.next}
                    </Button>
                </div>
            }
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PaginatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>, Range {
    maxPages?: number
    back?: React.ReactNode
    next?: React.ReactNode
    of?: React.ReactNode
    onBack(): void
    onNext(): void
    onSelect(idx: number): void
}

import './v1.css'

import {classes} from '@eviljs/react/classes.js'
import {asArray} from '@eviljs/std/type.js'
import type {ComponentProps} from 'react'
import {forwardRef, isValidElement} from 'react'

/*
* EXAMPLE
*
* <Table>
*     <TableHead>
*         <TableColumn>
*             Column 1
*         </TableColumn>
*         <TableColumn>
*             Column 2
*         </TableColumn>
*     </TableHead>
*     <TableBody>
*         {items.map((it, idx) =>
*             <TableRow key={idx}>
*                 <TableCell>
*                     Cell 1 of row {idx}
*                 </TableCell>
*                 <TableCell>
*                     Cell 2 of row {idx}
*                 </TableCell>
*             </TableRow>
*         )}
*     </TableBody>
* </Table>
*/
export function Table(props: TableProps) {
    const {
        children,
        className,
        footer,
        header,
        tableHeader,
        tableFooter,
        innerProps,
        scrollerProps,
        ...otherProps
    } = props
    const childrenList = asArray(children) as Array<React.ReactNode>
    const tableHead = childrenList.find(elementTypeTestFor(TableHead))
    const tableBody = childrenList.find(elementTypeTestFor(TableBody))

    return (
        <div
            {...otherProps}
            className={classes('Table-87f7', className)}
        >
            {header}

            <div
                {...scrollerProps}
                className={classes('TableScroller-ef6a', scrollerProps?.className)}
            >
                {tableHeader}

                <table
                    {...innerProps}
                    className={classes('table-inner-295a', innerProps?.className)}
                >
                    {tableHead}
                    {tableBody}
                </table>

                {tableFooter}
            </div>

            {footer}
        </div>
    )
}

export function TableHead(props: TableHeadProps) {
    const {children, className, innerProps, ...otherProps} = props
    const childrenList = asArray(children ?? []) as Array<React.ReactNode>
    const columns = childrenList.filter(elementTypeTestFor(TableColumn))

    return (
        <thead
            {...otherProps}
            className={classes('TableHead-00d9', className)}
        >
            <tr
                {...innerProps}
                className={classes('TableColumns-a6dc', innerProps?.className)}
            >
                {columns}
            </tr>
        </thead>
    )
}

export function TableColumn(props: TableColumnProps) {
    const {children, className, innerProps, ...otherProps} = props

    return (
        <th
            {...otherProps}
            className={classes('TableColumn-ebec', className)}
        >
            <div
                {...innerProps}
                className={classes('column-inner-a273', innerProps?.className)}
            >
                {children}
            </div>
        </th>
    )
}

export const TableBody = forwardRef(function TableBody(
    props: TableBodyProps,
    ref: React.ForwardedRef<HTMLTableSectionElement>,
) {
    const {children, className, ...otherProps} = props
    const childrenList = asArray(children ?? []) as Array<React.ReactNode>
    const rows = childrenList.filter(elementTypeTestFor(TableRow))

    return (
        <tbody
            {...otherProps}
            ref={ref}
            className={classes('TableBody-59b0', className)}
        >
            {rows}
        </tbody>
    )
})
TableBody.displayName = 'TableBody'

export const TableRow = forwardRef(function TableRow(
    props: TableRowProps,
    ref: React.ForwardedRef<HTMLTableRowElement>,
) {
    const {children, className, ...otherProps} = props
    const childrenList = asArray(children ?? []) as Array<React.ReactNode>
    const cells = childrenList.filter(elementTypeTestFor(TableCell))

    return (
        <tr
            {...otherProps}
            ref={ref}
            className={classes('TableRow-67ba', className)}
        >
            {cells}
        </tr>
    )
})
TableRow.displayName = 'TableRow'

export const TableCell = forwardRef(function TableCell(
    props: TableCellProps,
    ref: React.ForwardedRef<HTMLTableCellElement>,
) {
    const {children, className, innerProps, ...otherProps} = props

    return (
        <td
            {...otherProps}
            ref={ref}
            className={classes('TableCell-8df5', className)}
        >
            <div
                {...innerProps}
                className={classes('cell-inner-4d84', innerProps?.className)}
            >
                {children}
            </div>
        </td>
    )
})
TableCell.displayName = 'TableCell'

export function elementTypeTestFor<T extends React.JSXElementConstructor<any>>(type: T) {
    function test(element: React.ReactNode) {
        return isElementOfType(element, type)
    }

    return test
}

export function isElementOfType<T extends React.JSXElementConstructor<any>>(
    element: React.ReactNode,
    type: T,
): element is React.ReactElement<ComponentProps<T>, T>
{
    return true
        && isValidElement(element)
        && element.type === type
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
    footer?: undefined | React.ReactNode
    header?: undefined | React.ReactNode
    tableHeader?: undefined | React.ReactNode
    tableFooter?: undefined | React.ReactNode
    innerProps?: undefined | React.TableHTMLAttributes<HTMLTableElement>
    scrollerProps?: undefined | React.HTMLAttributes<HTMLDivElement>
}

export interface TableHeadProps extends React.HTMLAttributes<HTMLElement> {
    innerProps?: undefined | React.HTMLAttributes<HTMLTableRowElement>
}

export interface TableColumnProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
    innerProps?: undefined | React.HTMLAttributes<HTMLDivElement>
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLElement> {
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
}

export interface TableCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
    innerProps?: undefined | React.HTMLAttributes<HTMLDivElement>
}

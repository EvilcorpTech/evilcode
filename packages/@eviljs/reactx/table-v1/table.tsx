import {classes} from '@eviljs/react/classes.js'
import {displayName} from '@eviljs/react/display-name.js'
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
export const Table = displayName('Table', forwardRef(function Table(
    props: TableProps,
    ref: React.ForwardedRef<HTMLDivElement>,
) {
    const {
        children,
        className,
        footer,
        header,
        tableHeader,
        tableFooter,
        tableProps,
        scrollerProps,
        ...otherProps
    } = props
    const childrenList = asArray(children) as Array<React.ReactNode>
    const tableHead = childrenList.find(elementTypeTestFor(TableHead))
    const tableBody = childrenList.find(elementTypeTestFor(TableBody))

    return (
        <div
            {...otherProps}
            ref={ref}
            className={classes('Table-87f7', className)}
        >
            {header}

            <div
                {...scrollerProps}
                className={classes('TableScroller-ef6a', scrollerProps?.className)}
            >
                {tableHeader}

                <table
                    {...tableProps}
                    className={classes('table-inner-295a', tableProps?.className)}
                >
                    {tableHead}
                    {tableBody}
                </table>

                {tableFooter}
            </div>

            {footer}
        </div>
    )
}))

export const TableHead = displayName('TableHead', forwardRef(function TableHead(
    props: TableHeadProps,
    ref: React.ForwardedRef<HTMLTableSectionElement>,
) {
    const {children, className, rowProps, ...otherProps} = props
    const childrenList = asArray(children ?? []) as Array<React.ReactNode>
    const columns = childrenList.filter(elementTypeTestFor(TableColumn))

    return (
        <thead
            {...otherProps}
            ref={ref}
            className={classes('TableHead-00d9', className)}
        >
            <tr
                {...rowProps}
                className={classes('TableColumns-a6dc', rowProps?.className)}
            >
                {columns}
            </tr>
        </thead>
    )
}))

export const TableColumn = displayName('TableColumn', forwardRef(function TableColumn(
    props: TableColumnProps,
    ref: React.ForwardedRef<HTMLTableCellElement>,
) {
    const {children, className, innerProps, ...otherProps} = props

    return (
        <th
            {...otherProps}
            ref={ref}
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
}))

export const TableBody = displayName('TableBody', forwardRef(function TableBody(
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
}))

export const TableRow = displayName('TableRow', forwardRef(function TableRow(
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
}))

export const TableCell = displayName('TableCell', forwardRef(function TableCell(
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
}))

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
    scrollerProps?: undefined | React.HTMLAttributes<HTMLDivElement>
    tableFooter?: undefined | React.ReactNode
    tableHeader?: undefined | React.ReactNode
    tableProps?: undefined | React.TableHTMLAttributes<HTMLTableElement>
}

export interface TableHeadProps extends React.HTMLAttributes<HTMLElement>, React.RefAttributes<HTMLTableSectionElement> {
    rowProps?: undefined | React.HTMLAttributes<HTMLTableRowElement>
}

export interface TableColumnProps extends React.ThHTMLAttributes<HTMLTableCellElement>, React.RefAttributes<HTMLTableCellElement> {
    innerProps?: undefined | React.HTMLAttributes<HTMLDivElement>
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLElement>, React.RefAttributes<HTMLTableSectionElement> {
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement>, React.RefAttributes<HTMLTableRowElement> {
}

export interface TableCellProps extends React.ThHTMLAttributes<HTMLTableCellElement>, React.RefAttributes<HTMLTableCellElement> {
    innerProps?: undefined | React.HTMLAttributes<HTMLDivElement>
}

import {classes} from '@eviljs/react/classes'
import {displayName} from '@eviljs/react/display-name'
import type {ElementProps, Props, RefElementOf} from '@eviljs/react/props'
import {asArray} from '@eviljs/std/type-as'
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
    props: Props<TableProps>,
    ref: React.ForwardedRef<RefElementOf<TableProps>>,
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
    const tableFoot = childrenList.find(elementTypeTestFor(TableFoot))

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
                    {tableFoot}
                </table>

                {tableFooter}
            </div>

            {footer}
        </div>
    )
})) as React.FunctionComponent<TableProps>

export const TableHead = displayName('TableHead', forwardRef(function TableHead(
    props: Props<TableHeadProps>,
    ref: React.ForwardedRef<RefElementOf<TableHeadProps>>,
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
})) as React.FunctionComponent<TableHeadProps>

export const TableFoot = displayName('TableFoot', forwardRef(function TableFoot(
    props: Props<TableFootProps>,
    ref: React.ForwardedRef<RefElementOf<TableFootProps>>,
) {
    const {children, className, rowProps, ...otherProps} = props
    const childrenList = asArray(children ?? []) as Array<React.ReactNode>
    const columns = childrenList.filter(elementTypeTestFor(TableColumn))

    return (
        <tfoot
            {...otherProps}
            ref={ref}
            className={classes('TableFoot-92cd', className)}
        >
            <tr
                {...rowProps}
                className={classes('TableColumns-a6dc', rowProps?.className)}
            >
                {columns}
            </tr>
        </tfoot>
    )
})) as React.FunctionComponent<TableFootProps>

export const TableColumn = displayName('TableColumn', forwardRef(function TableColumn(
    props: Props<TableColumnProps>,
    ref: React.ForwardedRef<RefElementOf<TableColumnProps>>,
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
})) as React.FunctionComponent<TableColumnProps>

export const TableBody = displayName('TableBody', forwardRef(function TableBody(
    props: Props<TableBodyProps>,
    ref: React.ForwardedRef<RefElementOf<TableBodyProps>>,
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
})) as React.FunctionComponent<TableBodyProps>

export const TableRow = displayName('TableRow', forwardRef(function TableRow(
    props: Props<TableRowProps>,
    ref: React.ForwardedRef<RefElementOf<TableRowProps>>,
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
})) as React.FunctionComponent<TableRowProps>

export const TableCell = displayName('TableCell', forwardRef(function TableCell(
    props: Props<TableCellProps>,
    ref: React.ForwardedRef<RefElementOf<TableCellProps>>,
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
})) as React.FunctionComponent<TableCellProps>

export function elementTypeTestFor<T extends React.JSXElementConstructor<any>>(type: T): (element: React.ReactNode) => void {
    function test(element: React.ReactNode) {
        return isElementOfType(element, type)
    }

    return test
}

export function isElementOfType<T extends React.JSXElementConstructor<any>>(
    element: React.ReactNode,
    type: T,
): element is React.ReactElement<ComponentProps<T>, T> {
    return isValidElement(element) && element.type === type
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TableProps extends ElementProps<'div'> {
    footer?: undefined | React.ReactNode
    header?: undefined | React.ReactNode
    scrollerProps?: undefined | ElementProps<'div'>
    tableFooter?: undefined | React.ReactNode
    tableHeader?: undefined | React.ReactNode
    tableProps?: undefined | ElementProps<'table'>
}

export interface TableHeadProps extends ElementProps<'thead'> {
    rowProps?: undefined | ElementProps<'tr'>
}

export interface TableFootProps extends ElementProps<'tfoot'> {
    rowProps?: undefined | ElementProps<'tr'>
}

export interface TableColumnProps extends ElementProps<'th'> {
    innerProps?: undefined | ElementProps<'div'>
}

export interface TableBodyProps extends ElementProps<'tbody'> {
}

export interface TableRowProps extends ElementProps<'tr'> {
}

export interface TableCellProps extends ElementProps<'th'> {
    innerProps?: undefined | ElementProps<'div'>
}

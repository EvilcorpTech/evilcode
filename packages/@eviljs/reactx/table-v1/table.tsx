import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'
import {isElementType} from '@eviljs/react/type'
import {asArray} from '@eviljs/std/type-as'

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
export function Table(props: Props<TableProps>): React.JSX.Element {
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
    const tableHead = childrenList.find(it => isElementType(it, TableHead))
    const tableBody = childrenList.find(it => isElementType(it, TableBody))
    const tableFoot = childrenList.find(it => isElementType(it, TableFoot))

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
}

export function TableHead(props: Props<TableHeadProps>): React.JSX.Element {
    const {children, className, rowProps, ...otherProps} = props
    const childrenList = asArray(children ?? []) as Array<React.ReactNode>
    const columns = childrenList.filter(it => isElementType(it, TableColumn))

    return (
        <thead
            {...otherProps}
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
}

export function TableFoot(props: Props<TableFootProps>): React.JSX.Element {
    const {children, className, rowProps, ...otherProps} = props
    const childrenList = asArray(children ?? []) as Array<React.ReactNode>
    const columns = childrenList.filter(it => isElementType(it, TableColumn))

    return (
        <tfoot
            {...otherProps}
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
}

export function TableColumn(props: Props<TableColumnProps>): React.JSX.Element {
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

export function TableBody(props: Props<TableBodyProps>): React.JSX.Element {
    const {children, className, ...otherProps} = props
    const childrenList = asArray(children ?? []) as Array<React.ReactNode>
    const childrenRows = childrenList.filter(it => isElementType(it, TableRow))

    return (
        <tbody
            {...otherProps}
            className={classes('TableBody-59b0', className)}
        >
            {childrenRows}
        </tbody>
    )
}

export function TableRow(props: Props<TableRowProps>): React.JSX.Element {
    const {children, className, ...otherProps} = props
    const childrenList = asArray(children ?? []) as Array<React.ReactNode>
    const cells = childrenList.filter(it => isElementType(it, TableCell))

    return (
        <tr
            {...otherProps}
            className={classes('TableRow-67ba', className)}
        >
            {cells}
        </tr>
    )
}

export function TableCell(props: Props<TableCellProps>): React.JSX.Element {
    const {children, className, innerProps, ...otherProps} = props

    return (
        <td
            {...otherProps}
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

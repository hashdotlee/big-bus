/**
 * Table Component
 * Data table với compound components
 */

import React from 'react';
import { cn } from '../../utils/cn';

// Table
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'bordered' | 'striped';
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, variant = 'default', className, ...props }, ref) => {
    return (
      <div className="w-full overflow-auto">
        <table
          ref={ref}
          className={cn(
            'w-full text-sm text-left',
            variant === 'bordered' && 'border border-neutral-200',
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

// Table Header
export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ children, className, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={cn('bg-neutral-50 border-b border-neutral-200', className)}
      {...props}
    >
      {children}
    </thead>
  );
});

TableHeader.displayName = 'TableHeader';

// Table Body
export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(({ children, className, ...props }, ref) => {
  return (
    <tbody ref={ref} className={cn('divide-y divide-neutral-200', className)} {...props}>
      {children}
    </tbody>
  );
});

TableBody.displayName = 'TableBody';

// Table Row
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, hoverable = true, className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-neutral-200 last:border-0',
          hoverable && 'hover:bg-neutral-50 transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

// Table Head
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider',
          className
        )}
        {...props}
      >
        {children}
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

// Table Cell
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn('px-4 py-3 text-neutral-900', className)}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

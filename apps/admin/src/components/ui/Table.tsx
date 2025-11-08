import { HTMLAttributes, forwardRef, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={`min-w-full divide-y divide-gray-200 ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = '', children, ...props }, ref) => {
  return (
    <thead ref={ref} className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
});

TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = '', children, ...props }, ref) => {
  return (
    <tbody
      ref={ref}
      className={`divide-y divide-gray-200 bg-white ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
});

TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <tr ref={ref} className={`hover:bg-gray-50 ${className}`} {...props}>
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${className}`}
        {...props}
      >
        {children}
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <td ref={ref} className={`whitespace-nowrap px-6 py-4 text-sm ${className}`} {...props}>
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

export default Table;

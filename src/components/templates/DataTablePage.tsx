"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
} from "lucide-react";
import {
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import {
  Button,
  Card,
  Checkbox,
  EmptyState,
  ErrorState,
  Select,
  StatusBadge,
} from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import type { PortalRole } from "@/lib/routes";
import type { TableQueryParams } from "@/lib/query";
import type { StatusTone } from "@/types/domain";
import { cn } from "@/lib/utils";

const TABLE_FEATURES = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

export interface DataTableFilterConfig<T> {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  predicate: (row: T, selectedValue: string) => boolean;
}

export interface DataTableColumnConfig<T> {
  id: string;
  header: string;
  accessor: (row: T) => string | number;
  badgeTone?: (row: T) => StatusTone;
  href?: (row: T) => string;
  hideOnMobile?: boolean;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableActionLink {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "secondary";
}

export interface DataTableServerConfig {
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onQueryChange: (params: TableQueryParams) => void;
}

export interface DataTablePageProps<T extends { id: string }> {
  role: PortalRole;
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  rows: T[];
  columns: DataTableColumnConfig<T>[];
  filters?: DataTableFilterConfig<T>[];
  primaryAction?: DataTableActionLink;
  secondaryActions?: DataTableActionLink[];
  enableExport?: boolean;
  exportFilename?: string;
  enableBulkSelect?: boolean;
  bulkActionLabel?: string;
  onBulkAction?: (selectedIds: string[]) => void;
  rowActions?: (row: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  topSummary?: React.ReactNode;
  serverSide?: DataTableServerConfig;
}

export function DataTablePage<T extends { id: string }>({
  role,
  title,
  subtitle,
  searchPlaceholder = "Search records...",
  rows,
  columns,
  filters = [],
  primaryAction,
  secondaryActions = [],
  enableExport = true,
  exportFilename = "educore-export.csv",
  enableBulkSelect = false,
  bulkActionLabel = "Apply Bulk Action",
  onBulkAction,
  rowActions,
  emptyTitle = "No matching records",
  emptyDescription = "Try clearing your search term or switching active filters.",
  topSummary,
  serverSide,
}: DataTablePageProps<T>) {
  const { showToast } = useToast();
  const [search, setSearch] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: serverSide?.pageSize ?? 8,
  });

  const emitServerQuery = React.useCallback(
    (
      nextPage: number,
      nextSearch: string,
      nextFilters: Record<string, string>,
      nextSorting: SortingState,
    ) => {
      if (!serverSide) return;
      const firstSort = nextSorting[0];
      serverSide.onQueryChange({
        page: nextPage,
        pageSize: serverSide.pageSize,
        search: nextSearch || undefined,
        sortBy: firstSort?.id,
        sortDir: firstSort ? (firstSort.desc ? "desc" : "asc") : undefined,
        filters: nextFilters,
      });
    },
    [serverSide],
  );

  const filteredRows = React.useMemo(() => {
    if (serverSide) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      for (const f of filters) {
        const selected = filterValues[f.key] ?? "all";
        if (selected !== "all" && !f.predicate(row, selected)) {
          return false;
        }
      }
      if (!q) return true;
      return columns.some((col) =>
        String(col.accessor(row)).toLowerCase().includes(q),
      );
    });
  }, [serverSide, rows, filters, filterValues, search, columns]);

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    emitServerQuery(1, nextSearch, filterValues, sorting);
  };

  const handleFilterChange = (key: string, value: string) => {
    const nextFilters = { ...filterValues, [key]: value };
    setFilterValues(nextFilters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    emitServerQuery(1, search, nextFilters, sorting);
  };

  const handleSortClick = (columnId: string) => {
    setSorting((prev) => {
      const current = prev.find((s) => s.id === columnId);
      const next = !current
        ? [{ id: columnId, desc: false }]
        : !current.desc
          ? [{ id: columnId, desc: true }]
          : [];
      emitServerQuery(1, search, filterValues, next);
      return next;
    });
  };

  const tableColumns = React.useMemo<ColumnDef<typeof TABLE_FEATURES, T>[]>(
    () =>
      columns.map((col) => ({
        id: col.id,
        header: col.header,
        accessorFn: (row: T) => col.accessor(row),
        enableSorting: col.sortable !== false,
        sortingFn: "alphanumeric",
      })),
    [columns],
  );

  const table = useTable({
    features: TABLE_FEATURES,
    columns: tableColumns,
    data: filteredRows,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const pageRows = serverSide
    ? table.getRowModel().rows.slice(0, serverSide.pageSize)
    : table.getRowModel().rows;
  const totalCount = serverSide ? serverSide.total : filteredRows.length;
  const currentPage = serverSide ? serverSide.page : pagination.pageIndex + 1;
  const effectivePageSize = serverSide ? serverSide.pageSize : pagination.pageSize;
  const pageCount = Math.max(1, Math.ceil(totalCount / effectivePageSize));
  const canPrev = serverSide ? currentPage > 1 : table.getCanPreviousPage();
  const canNext = serverSide ? currentPage < pageCount : table.getCanNextPage();
  const allVisibleSelected =
    pageRows.length > 0 && pageRows.every((r) => selectedIds.includes(r.original.id));

  const toggleAllVisible = (checked: boolean) => {
    if (checked) {
      const next = Array.from(new Set([...selectedIds, ...pageRows.map((r) => r.original.id)]));
      setSelectedIds(next);
    } else {
      const pageIdSet = new Set(pageRows.map((r) => r.original.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIdSet.has(id)));
    }
  };

  const toggleSingle = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const handleExportCsv = () => {
    const headerLine = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
    const bodyLines = filteredRows.map((r) =>
      columns
        .map((c) => `"${String(c.accessor(r)).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csvContent = [headerLine, ...bodyLines].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredRows.length} rows to ${exportFilename}`);
  };

  const colMap = React.useMemo(
    () => new Map(columns.map((c) => [c.id, c])),
    [columns],
  );

  const renderCellContent = (col: DataTableColumnConfig<T>, row: T) => {
    if (col.render) return col.render(row);
    const val = String(col.accessor(row));
    if (col.badgeTone) {
      return <StatusBadge tone={col.badgeTone(row)}>{val}</StatusBadge>;
    }
    if (col.href) {
      return (
        <Link href={col.href(row)} className="font-semibold text-brand hover:underline">
          {val}
        </Link>
      );
    }
    return <span>{val}</span>;
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2.5">
      {secondaryActions.map((act) =>
        act.href ? (
          <Link key={act.label} href={act.href}>
            <Button variant={act.variant ?? "outline"}>{act.label}</Button>
          </Link>
        ) : (
          <Button key={act.label} variant={act.variant ?? "outline"} onClick={act.onClick}>
            {act.label}
          </Button>
        ),
      )}
      {enableExport ? (
        <Button variant="outline" onClick={handleExportCsv}>
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Export CSV</span>
        </Button>
      ) : null}
      {primaryAction ? (
        primaryAction.href ? (
          <Link href={primaryAction.href}>
            <Button variant={primaryAction.variant ?? "primary"}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{primaryAction.label}</span>
            </Button>
          </Link>
        ) : (
          <Button variant={primaryAction.variant ?? "primary"} onClick={primaryAction.onClick}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>{primaryAction.label}</span>
          </Button>
        )
      ) : null}
    </div>
  );

  return (
    <AppShell role={role} title={title} subtitle={subtitle} actions={headerActions}>
      {topSummary}

      <Card className="p-4 flex flex-col gap-4 min-w-0 w-full">
        <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
          <div className="relative flex-1 min-w-0">
            <label htmlFor="dt-search" className="sr-only">
              {searchPlaceholder}
            </label>
            <Search
              className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="dt-search"
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="min-h-11 w-full rounded-md bg-subtle border border-line pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-2 focus:outline-offset-0 focus:outline-line-focus"
            />
          </div>

          {filters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex items-center gap-3">
              {filters.map((filter) => (
                <div key={filter.key} className="min-w-[160px]">
                  <Select
                    aria-label={filter.label}
                    value={filterValues[filter.key] ?? "all"}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    options={[{ label: `All ${filter.label}`, value: "all" }, ...filter.options]}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {enableBulkSelect && selectedIds.length > 0 ? (
          <div className="rounded-md bg-brand-soft px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-brand">
              {selectedIds.length} record{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  onBulkAction?.(selectedIds);
                  showToast(`${bulkActionLabel} applied to ${selectedIds.length} record(s)`);
                  setSelectedIds([]);
                }}
              >
                {bulkActionLabel}
              </Button>
            </div>
          </div>
        ) : null}

        {serverSide?.error ? (
          <ErrorState description={serverSide.error} onRetry={serverSide.onRetry} />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={
              search || Object.values(filterValues).some((v) => v && v !== "all") ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setFilterValues({});
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                    emitServerQuery(1, "", {}, sorting);
                  }}
                >
                  Reset Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto" tabIndex={0} role="region" aria-label={title}>
              <table className="w-full text-left border-collapse">
                <thead>
                  {table.getHeaderGroups().map((group) => (
                    <tr key={group.id} className="bg-subtle border-b border-line">
                      {enableBulkSelect ? (
                        <th className="py-2.5 px-3 w-12">
                          <span className="sr-only">Select</span>
                          <Checkbox
                            label=""
                            ariaLabel="Select all rows"
                            checked={allVisibleSelected}
                            onChange={toggleAllVisible}
                          />
                        </th>
                      ) : null}
                      {group.headers.map((header) => {
                        const col = colMap.get(header.id);
                        const sorted = sorting.find((s) => s.id === header.id);
                        const canSort = col?.sortable !== false;
                        return (
                          <th
                            key={header.id}
                            className="py-3 px-4 text-xs font-semibold text-ink-secondary whitespace-nowrap"
                          >
                            {canSort ? (
                              <button
                                type="button"
                                onClick={() => handleSortClick(header.id)}
                                className="inline-flex items-center gap-1.5 hover:text-ink cursor-pointer"
                              >
                                <span>{col?.header ?? header.id}</span>
                                {sorted ? (
                                  sorted.desc ? (
                                    <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                                  ) : (
                                    <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                                  )
                                ) : (
                                  <ArrowUpDown className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                                )}
                              </button>
                            ) : (
                              <span>{col?.header ?? header.id}</span>
                            )}
                          </th>
                        );
                      })}
                      {rowActions ? (
                        <th className="py-3 px-4 text-xs font-semibold text-ink-secondary text-right">
                          Actions
                        </th>
                      ) : null}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-line">
                  {pageRows.map((row) => (
                    <tr key={row.id} className="hover:bg-subtle/60 transition-colors">
                      {enableBulkSelect ? (
                        <td className="py-2.5 px-3">
                          <Checkbox
                            label=""
                            ariaLabel={`Select row ${row.original.id}`}
                            checked={selectedIds.includes(row.original.id)}
                            onChange={(checked) => toggleSingle(row.original.id, checked)}
                          />
                        </td>
                      ) : null}
                      {columns.map((col) => (
                        <td key={col.id} className="py-3.5 px-4 text-sm text-ink">
                          {renderCellContent(col, row.original)}
                        </td>
                      ))}
                      {rowActions ? (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {rowActions(row.original)}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col gap-3">
              {pageRows.map((row) => {
                const item = row.original;
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-line bg-surface p-4 flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold text-sm text-ink">
                        {columns[0] ? renderCellContent(columns[0], item) : item.id}
                      </div>
                      {enableBulkSelect ? (
                        <Checkbox
                          label=""
                          ariaLabel={`Select row ${item.id}`}
                          checked={selectedIds.includes(item.id)}
                          onChange={(checked) => toggleSingle(item.id, checked)}
                        />
                      ) : null}
                    </div>
                    <dl className="grid grid-cols-1 gap-1.5 text-xs">
                      {columns.slice(1).map((col) => (
                        <div key={col.id} className="flex items-center justify-between gap-2 py-0.5">
                          <dt className="text-ink-secondary">{col.header}</dt>
                          <dd className="text-ink font-medium text-right">
                            {renderCellContent(col, item)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {rowActions ? (
                      <div className="pt-2 border-t border-line flex justify-end gap-2">
                        {rowActions(item)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-secondary">
              <span>
                Showing {totalCount === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1}–
                {Math.min(currentPage * effectivePageSize, totalCount)} of {totalCount} entries
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canPrev}
                  onClick={() => {
                    if (serverSide) {
                      emitServerQuery(currentPage - 1, search, filterValues, sorting);
                    } else {
                      table.previousPage();
                    }
                  }}
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Previous</span>
                </Button>
                <span className={cn("px-2 font-medium text-ink")}>
                  Page {currentPage} of {pageCount}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canNext}
                  onClick={() => {
                    if (serverSide) {
                      emitServerQuery(currentPage + 1, search, filterValues, sorting);
                    } else {
                      table.nextPage();
                    }
                  }}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </AppShell>
  );
}
